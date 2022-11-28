// Composables
import { createDefaults, DefaultsSymbol } from 'vuetify/lib/composables/defaults.mjs'
import { createDisplay, DisplaySymbol } from 'vuetify/lib/composables/display.mjs'
import { createIcons, IconSymbol } from 'vuetify/lib/composables/icons.mjs'
import { createLocale, LocaleSymbol } from 'vuetify/lib/composables/locale.mjs'
import { createTheme, ThemeSymbol } from './theme'

// Utilities
import { defineComponent, getUid, IN_BROWSER, mergeDeep } from 'vuetify/lib/util/index.mjs'
import { version } from 'vuetify/package.json'
import { nextTick, reactive } from 'vue'

// Types
import type { App, ComponentPublicInstance, InjectionKey } from 'vue'
import type { VuetifyOptions } from 'vuetify'
import type { NuxtApp } from 'nuxt/app'

export interface Blueprint extends Omit<VuetifyOptions, 'blueprint'> { }

interface VueApp extends App {
    $nuxt: NuxtApp
}

export function createVuetify(vuetify: VuetifyOptions = {}) {
    const { blueprint, ...rest } = vuetify
    const options = mergeDeep(blueprint, rest)
    const {
        aliases = {},
        components = {},
        directives = {},
    } = options

    const defaults = createDefaults(options.defaults)
    const display = createDisplay(options.display, options.ssr)
    const theme = createTheme(options.theme)
    const icons = createIcons(options.icons)
    const locale = createLocale(options.locale)

    const install = (app: VueApp) => {
        for (const key in directives) {
            app.directive(key, directives[key])
        }

        for (const key in components) {
            app.component(key, components[key])
        }

        for (const key in aliases) {
            app.component(key, defineComponent({
                ...aliases[key],
                name: key,
                aliasName: aliases[key].name,
            }))
        }

        theme.install(app)

        app.provide(DefaultsSymbol, defaults)
        app.provide(DisplaySymbol, display)
        app.provide(ThemeSymbol, theme)
        app.provide(IconSymbol, icons)
        app.provide(LocaleSymbol, locale)

        if (IN_BROWSER && options.ssr) {
            if (app.$nuxt) {
                app.$nuxt.hook('app:suspense:resolve', () => {
                    display.update()
                })
            } else {
                const { mount } = app
                app.mount = (...args) => {
                    const vm = mount(...args)
                    nextTick(() => display.update())
                    app.mount = mount
                    return vm
                }
            }
        }

        getUid.reset()

        app.mixin({
            computed: {
                $vuetify() {
                    return reactive({
                        defaults: inject.call(this, DefaultsSymbol),
                        display: inject.call(this, DisplaySymbol),
                        theme: inject.call(this, ThemeSymbol),
                        icons: inject.call(this, IconSymbol),
                        locale: inject.call(this, LocaleSymbol),
                    })
                },
            },
        })
    }

    return {
        install,
        defaults,
        display,
        theme,
        icons,
        locale,
    }
}

createVuetify.version = version

// Vue's inject() can only be used in setup
function inject(this: ComponentPublicInstance, key: InjectionKey<any> | string) {
    const vm = this.$

    // @ts-ignore
    const provides = vm.parent?.provides ?? vm.vnode.appContext?.provides

    if (provides && (key as any) in provides) {
        return provides[(key as string)]
    }
}
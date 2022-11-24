import type { ModuleOptions } from './types';
import type { Nuxt } from '@nuxt/schema'
import { name, version } from "../package.json";
import { defineNuxtModule, addPluginTemplate, createResolver, addImports } from '@nuxt/kit';
import vuetify from 'vite-plugin-vuetify'

const CONFIG_KEY = 'vuetify'

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    defaults: {
        vuetifyOptions: {},
        pluginOptions: {},
    } as ModuleOptions,
    async setup(moduleOptions, nuxt) {
        const options: ModuleOptions = moduleOptions

        const { resolve } = createResolver(import.meta.url)

        options.pluginOptions!.styles = options.pluginOptions?.styles ?? true

        if (typeof options.pluginOptions?.styles === 'string' && ['sass', 'expose'].includes(options.pluginOptions.styles)) {
            nuxt.options.css.unshift('vuetify/styles/main.sass')
        }
        else if (options.pluginOptions?.styles === true) {
            nuxt.options.css.unshift('vuetify/styles')
        }

        // Transpile Vuetify
        nuxt.options.build.transpile.push(CONFIG_KEY)

        nuxt.hook('vite:extendConfig', (config) => {
            // Vuetify plugin configuration
            config.plugins = [
                ...(config.plugins || []),
                vuetify(options.pluginOptions),
            ]

            config.define = {
                ...(config.define || {}),
                'process.env.DEBUG': false,
            }

            // @ts-ignore: name property is there but not in the typing
            const vueIndex = config.plugins.findIndex((plugin) => plugin.name === 'vite:vue')
            if (vueIndex !== -1) {
                const vuePlugin = config.plugins.splice(vueIndex, 1)[0]
                config.plugins.unshift(vuePlugin)
            }

            config.ssr = config.ssr || {}
            config.ssr.noExternal = Array.isArray(config.ssr!.noExternal) ? config.ssr.noExternal : []
            config.ssr.noExternal.push(CONFIG_KEY)
        })

        const selectedIcon = options.vuetifyOptions?.icons?.defaultSet ?? 'mdi'

        if (Object.hasOwn(cdnPresets, selectedIcon)) {
            setupIcons(nuxt, selectedIcon as IconPreset)
        }

        addPluginTemplate({
            src: resolve('./runtime/templates/plugin.mjs'),
            filename: 'vuetify.plugin.mjs',
            options: {
                options: options.vuetifyOptions
            }
        })

        // vuetify-specific composables
        addImports([
            { from: CONFIG_KEY, name: 'useTheme' },
            { from: CONFIG_KEY, name: 'useDisplay' },
            { from: CONFIG_KEY, name: 'useRtl' },
            { from: CONFIG_KEY, name: 'useLocale' },
            { from: CONFIG_KEY, name: 'useLayout' }
        ])
    }
})

type IconPreset = keyof typeof cdnPresets

const cdnPresets = {
    mdi: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
    md: 'https://fonts.googleapis.com/css?family=Material+Icons',
    fa: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@latest/css/all.min.css'
}

function setupIcons(nuxt: Nuxt, preset: IconPreset) {
    if (cdnPresets[preset]) {
        nuxt.options.app.head.link = nuxt.options.app.head.link || []
        nuxt.options.app.head.link.push({
            rel: 'stylesheet',
            type: 'text/css',
            href: cdnPresets[preset]
        })
    }
}
import type { ModuleOptions } from './types';
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

            config.ssr!.noExternal = Array.isArray(config.ssr!.noExternal) ? config.ssr!.noExternal : []
            config.ssr!.noExternal.push(CONFIG_KEY)
        })

        // vuetify-specific composables
        addImports([
            { from: CONFIG_KEY, name: 'useTheme' },
            { from: CONFIG_KEY, name: 'useDisplay' },
            { from: CONFIG_KEY, name: 'useRtl' },
            { from: CONFIG_KEY, name: 'useLocale' },
            { from: CONFIG_KEY, name: 'useLayout' }
        ])

        addPluginTemplate({
            src: resolve('./runtime/templates/plugin.mjs'),
            filename: 'vuetify.plugin.mjs',
            options: options.vuetifyOptions
        })
    }
})
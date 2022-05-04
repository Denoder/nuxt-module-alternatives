import { name, version } from "../package.json";
import { defineNuxtModule, addVitePlugin, extendViteConfig, addPluginTemplate, createResolver } from '@nuxt/kit'
import ViteComponents from 'unplugin-vue-components/vite'
import { VuetifyResolver } from './resolver'

interface ModuleOptions {
    config: object
    plugins: Array<any>
    customVariables: Array<string>
}

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: 'vuetify',
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    defaults: {
        config: {},
        plugins: [],
        customVariables: [],
    } as ModuleOptions,
    async setup(moduleOptions, nuxt) {

        const options = {
            ...moduleOptions,
            ...nuxt.options['vuetify']
        }

        // Custom variables
        if (options.customVariables && options.customVariables.length > 0) {
            const sassImports = options.customVariables
            .map(path => `@import '${path}'`)
            .join('\n')

            const scssImports = options.customVariables
            .map(path => `@import '${path}';`)
            .join('\n')

            extendViteConfig(config => {
                const sassOptions = {
                    preprocessorOptions: {
                        sass: {
                            additionalData: [...sassImports].join('\n')
                        },
                        scss: {
                            additionalData: [...scssImports].join('\n')
                        }
                    }
                }

                config.css = {
                    ...config.css,
                    ...sassOptions
                }
            })
        }

        const vitePlugins = [
            ViteComponents({
                resolvers: [
                    VuetifyResolver(),
                    ...options.plugins
                ],
            }),
        ];

        vitePlugins.forEach(plugin => {
            addVitePlugin(plugin)
        })

        extendViteConfig(config => {
            // @ts-ignore
            config.ssr.noExternal = config.ssr.noExternal || []
            // @ts-ignore
            config.ssr.noExternal.push('vuetify')
        })

        const { resolve } = createResolver(import.meta.url)

        addPluginTemplate({
            src: resolve('./runtime/templates/plugin.mjs'),
            fileName: 'vuetify.plugin.mjs',
            options: options.config
        })
    }
})

declare module "#app" {
    export interface NuxtConfig {
        vuetify: ModuleOptions;
    }
}
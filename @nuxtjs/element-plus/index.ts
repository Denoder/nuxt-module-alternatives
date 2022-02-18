import { defineNuxtModule, addVitePlugin, addWebpackPlugin } from '@nuxt/kit'
import ViteAutoImport from 'unplugin-auto-import/vite'
import ViteComponents from 'unplugin-vue-components/vite'
import WebpackAutoImport from 'unplugin-auto-import/webpack'
import WebpackComponents from 'unplugin-vue-components/webpack'
import { ElementPlusResolver } from './element-resolver'

export default defineNuxtModule({
    meta: {
        name: '@nuxtjs/element-plus',
        configKey: 'element',
        type: "module",
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    defaults: {
        mode: 'vite',
        components: false,
        autoimport: false
    },
    async setup(moduleOptions, nuxt) {
        // Merge all option sources
        const options = {
            ...moduleOptions,
            ...nuxt.options.element
        }

        const vitePlugins = [
            ViteAutoImport({
                resolvers: [
                    ElementPlusResolver(options.autoimport)
                ],
            }),
            ViteComponents({
                resolvers: [
                    ElementPlusResolver(options.components)
                ],
            })
        ];

        const webpackPlugins = [
            WebpackAutoImport({
                resolvers: [
                    ElementPlusResolver(options.autoimport)
                ],
            }),
            WebpackComponents({
                resolvers: [
                    ElementPlusResolver(options.components)
                ],
            })
        ];

        if (options.mode === 'vite') {
            vitePlugins.forEach(plugin => {
                addVitePlugin(plugin)
            })
        }

        if (options.mode === 'webpack') {
            webpackPlugins.forEach(plugin => {
                addWebpackPlugin(plugin)
            })
        }
    }
})

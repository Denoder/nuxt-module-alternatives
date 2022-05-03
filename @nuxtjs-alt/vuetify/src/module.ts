import { name, version } from "../package.json";
import { defineNuxtModule, addVitePlugin, extendViteConfig, addPluginTemplate, createResolver } from '@nuxt/kit'
import ViteComponents from 'unplugin-vue-components/vite'
import { VuetifyResolver } from './resolver'
import vuetify from '@vuetify/vite-plugin';

interface ModuleOptions {
    config: object
    styles: object
    plugins: Array<any>
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
        styles: {},
        plugins: []
    } as ModuleOptions,
    async setup(moduleOptions, nuxt) {

        const options = {
            ...moduleOptions,
            ...nuxt.options['vuetify']
        }

        const vitePlugins = [
            ViteComponents({
                resolvers: [
                    VuetifyResolver(),
                    ...options.plugins
                ],
            }),
            vuetify({ autoImport: false, ...options.styles }),
        ];

        vitePlugins.forEach(plugin => {
            // @ts-ignore
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
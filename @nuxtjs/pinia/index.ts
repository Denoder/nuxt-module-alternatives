import { resolve } from 'path'
import { defineNuxtModule, addPluginTemplate } from '@nuxt/kit'

export interface ModuleOptions {
    storeName: String
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: '@nuxtjs/pinia',
        configKey: 'pinia',
        type: "module",
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    defaults: {
        storeName: 'pinia'
    },
    async setup(moduleOptions, nuxt) {
        // Merge all option sources
        const options = {
            ...moduleOptions,
            ...nuxt.options.pinia,
        }

        // Add Pinia Plugin
        addPluginTemplate({
            src: resolve(__dirname, 'templates/plugin.ts'),
            options
        })
    }
})

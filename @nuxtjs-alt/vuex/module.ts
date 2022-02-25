import { resolve, join } from 'path'
import { defineNuxtModule, addPluginTemplate, addAutoImport } from '@nuxt/kit'

export interface ModuleOptions {
    storeFolder: String,
    storeName: String
}

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name: '@nuxtjs-alt/vuex',
        configKey: 'vuex',
        type: "module",
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    defaults: {
        storeName: 'vuex',
        storeFolder: 'store'
    },
    async setup(moduleOptions, nuxt) {
        // Merge all option sources
        const options = {
            ...moduleOptions,
            ...nuxt.options.vuex,
        }

        options.store = resolve(nuxt.options.srcDir, options.storeFolder)

        // Add Vuex (Vue3)
        addPluginTemplate({
            src: resolve(__dirname, './templates/vuex.ts'),
            fileName: join('vuex.mjs'),
            options
        })

        addAutoImport({ name: 'vuexStore', as: 'vuexStore' , from: resolve(__dirname, 'composables/vuexStore') })

        nuxt.options.build.transpile.push(__dirname)
    }
})
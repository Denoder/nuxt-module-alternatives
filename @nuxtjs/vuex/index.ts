import { resolve, join } from 'path'
import { defineNuxtModule, addPluginTemplate } from '@nuxt/kit'
import Glob from 'glob'

export default defineNuxtModule({
    meta: {
        name: '@nuxtjs/vuex',
        configKey: 'vuex',
        type: "module",
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    defaults: {
        devtools: false,
        storeName: 'vuex',
        storeFolder: 'store'
    },
    async setup(moduleOptions, nuxt) {
        // Merge all option sources
        const options = {
            ...moduleOptions,
            ...nuxt.options.vuex,
        }

        options.storeModules = await resolveStore(options, nuxt)

        // Add Vuex (Vue3)
        addPluginTemplate({
            src: resolve(__dirname, './vuex.ts'),
            fileName: join('vuex.mjs'),
            options
        })
    }
})

let resolveStore = async (options, nuxt) => {
    return (await resolveRelative(resolve(nuxt.options.srcDir, options.storeFolder))).sort(({ src: p1 }, { src: p2 }) => {
        let res = p1.split('/').length - p2.split('/').length
        if (res === 0 && p1.includes('/index.')) {
            res = -1
        } else if (res === 0 && p2.includes('/index.')) {
            res = 1
        }
        return res
    })
}


let resolveRelative = async (dir) => {
    const dirPrefix = new RegExp(`^${dir}/`)
    return (await resolveFiles(dir)).map(file => ({ 
        src: file.replace(dirPrefix, ''),
        fullPath: file,
    }))
}

// Resolve files
let resolveFiles = async (dir) => {
    return await new Promise((resolve, reject) => {
        Glob(`${dir}/**/*.{js,ts}`, (err, files) => {
            if (err) {
                reject(err)
            } else {
                resolve(files)
            }
        })
    })
}
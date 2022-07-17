import { name, version } from '../package.json'
import { defineNuxtModule } from '@nuxt/kit'
import { createMiddlewareFile } from './options'

const CONFIG_KEY = 'proxy' 

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    setup(moduleOptions, nuxt) {
        const options = {
            ...moduleOptions,
            ...nuxt.options[CONFIG_KEY]
        }

        createMiddlewareFile(options, nuxt)
    }
})

declare module "#app" {
    export interface NuxtConfig {
        proxy?: object
    }
}

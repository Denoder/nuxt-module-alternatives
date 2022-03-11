import { name, version } from '../package.json'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { addServerMiddleware, defineNuxtModule } from '@nuxt/kit'
import { createMiddlewareFile, HttpProxyOptions, getProxyEntries, NuxtProxyOptions } from './options'

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
    setup(options: HttpProxyOptions, nuxt) {
        // Defaults
        const defaults: HttpProxyOptions = {
            changeOrigin: true,
            ws: true
        }

        const proxyEntries = getProxyEntries(options as NuxtProxyOptions, defaults)

        // addServerMiddleware wont accept a function in build mode for some reason so to circumvent this we create a file for each entry
        // the folder will regenerate the files on every build
        Object.values(proxyEntries).forEach((proxyEntry: any, index: number) => {
            if (process.env.NODE_ENV !== 'production') {
                // dev mode works fine
                addServerMiddleware({ handle: createProxyMiddleware(proxyEntry.context, proxyEntry.options) })
            } else {
                // production mode requires file creation (for some reason)
                createMiddlewareFile({ proxyEntry, index, nuxt })
            }
        });
    }
})

declare module "@nuxt/kit" {
    export interface NuxtConfig {
        proxy?: NuxtProxyOptions
    }
}

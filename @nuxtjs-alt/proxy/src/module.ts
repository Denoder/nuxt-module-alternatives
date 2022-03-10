import { name, version } from '../package.json'
import { defineNuxtModule, addServerMiddleware, createResolver } from '@nuxt/kit'
import { HttpProxyOptions, getProxyEntries, NuxtProxyOptions } from './options'
import fs from 'fs-extra'

declare module "@nuxt/kit" {
    export interface NuxtConfig {
        proxy?: NuxtProxyOptions
    }
}

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
    async setup(options: HttpProxyOptions, nuxt) {

        // Defaults
        const defaults: HttpProxyOptions = {
            changeOrigin: true,
            ws: true,
            ...options
        }

        const proxyEntries = getProxyEntries(options as NuxtProxyOptions, defaults)
        // resolver
        const resolver = createResolver(import.meta.url)
        const proxyDirectory = resolver.resolve('runtime/server/middleware')

        // Create & Register middleware
        Object.values(proxyEntries).forEach(async (proxyEntry, index) => {
            // addServerMiddleware wont accept a function so to circumvent this we create a file for each entry
            const filePath = proxyDirectory + `/proxy-${index}.ts`

            fs.emptyDir(proxyDirectory).then(() => {
                fs.outputFile(filePath, proxyContents(proxyEntry))
                .then(() => {
                    addServerMiddleware(filePath)
                })
                .catch(err => {
                    console.error(err)
                });
            })
            .catch(err => {
                console.error(err)
            })
        });
    }
})

const proxyContents = (entry: any): string => {
return `
import type { IncomingMessage, ServerResponse } from 'http'
import { createProxyMiddleware } from 'http-proxy-middleware'

const middleware = createProxyMiddleware('${entry.context}', ${JSON.stringify(entry.options)})

export default async (req: IncomingMessage, res: ServerResponse) => {

    await new Promise<void>((resolve, reject) => {
        const next = (err?: unknown) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        }

        middleware(req, res, next)
    })
}`
}

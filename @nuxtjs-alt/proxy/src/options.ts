import { createResolver } from '@nuxt/kit'
import fs from 'fs-extra'

import type { Filter, Options as HttpProxyOptions } from 'http-proxy-middleware'
export type { Options as HttpProxyOptions } from 'http-proxy-middleware'

export type ProxyContext = Filter | HttpProxyOptions
export type ProxyEntry = { context: ProxyContext, options: HttpProxyOptions }

export type ProxyOptionsObject = { [target: string]: HttpProxyOptions }
export type ProxyOptionsArray = Array<[ProxyContext, HttpProxyOptions?] | HttpProxyOptions | string>
export type NuxtProxyOptions = ProxyOptionsObject | ProxyOptionsArray

export function getProxyEntries(proxyOptions: NuxtProxyOptions, defaults: HttpProxyOptions): ProxyEntry[] {
    const applyDefaults = (opts?: HttpProxyOptions) => ({ ...defaults, ...opts }) as HttpProxyOptions
    const normalizeTarget = (input: string | HttpProxyOptions) => (typeof input === 'object' ? input : { target: input }) as HttpProxyOptions

    const proxyEntries: ProxyEntry[] = []

    if (!proxyOptions) {
        return proxyEntries
    }

    // Object mode
    if (!Array.isArray(proxyOptions)) {
        for (const key in proxyOptions) {
            proxyEntries.push({
                context: key,
                options: applyDefaults(normalizeTarget(proxyOptions[key]))
            })
        }
        return proxyEntries
    }

    // Array mode
    for (const input of proxyOptions) {
        if (Array.isArray(input)) {
            proxyEntries.push({
                context: input[0],
                options: applyDefaults(normalizeTarget(input[1] as string))
            })
        } else {
            proxyEntries.push({
                context: input,
                options: applyDefaults()
            })
        }
    }

    return proxyEntries
}

export function createMiddlewareFile(opt: {
    proxyEntry: ProxyEntry,
    index: number,
    nuxt: any
}): void {
    try {
        const resolver = createResolver(opt.nuxt.options.srcDir)
        const proxyDirectory = resolver.resolve('server/middleware/@proxy')
        const filePath = proxyDirectory + `/proxy-${opt.index}.ts`

        fs.outputFileSync(filePath, proxyMiddlewareContent(opt.proxyEntry))
    }
    catch (err) {
        console.error(err)
    }
}

export function proxyMiddlewareContent(entry: {
    context: ProxyContext,
    options: HttpProxyOptions
}): string {
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

        /* @ts-ignore */
        middleware(req, res, next)
    })
}`
}
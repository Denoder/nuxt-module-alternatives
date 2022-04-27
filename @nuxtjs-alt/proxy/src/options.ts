import { createResolver } from '@nuxt/kit'
import fs from 'fs-extra'

export function createMiddlewareFile(proxyEntries: object, nuxt: any): void {
    try {
        const resolver = createResolver(nuxt.options.srcDir)
        const proxyDirectory = resolver.resolve('server/middleware/@proxy')
        const filePath = proxyDirectory + '/proxy.ts'

        fs.outputFileSync(filePath, proxyMiddlewareContent(proxyEntries))
    }
    catch (err) {
        console.error(err)
    }
}

export function proxyMiddlewareContent(options: object): string {
return `
import type * as http from 'http'
import httpProxy from 'http-proxy'
import type { HttpProxy } from 'http-proxy'
import { defineEventHandler } from 'h3'

interface ProxyOptions extends HttpProxy.ServerOptions {
    /**
     * rewrite path
     */
    rewrite?: (path: string) => string
    /**
     * configure the proxy server (e.g. listen to events)
     */
    configure?: (proxy: HttpProxy.Server, options: ProxyOptions) => void
    /**
     * webpack-dev-server style bypass function
     */
    bypass?: (
        req: http.IncomingMessage,
        res: http.ServerResponse,
        options: ProxyOptions
    ) => void | null | undefined | false | string
}

// lazy require only when proxy is used
const proxies: Record<string, [HttpProxy.Server, ProxyOptions]> = {}
let options = ${JSON.stringify(options)};

Object.keys(options).forEach((context) => {
    let opts = options[context]

    if (typeof opts === 'string') {
        opts = { target: opts, changeOrigin: true } as ProxyOptions
    }

    if (isObject(opts)) {
        opts = { changeOrigin: true, ...opts } as ProxyOptions
    }

    const proxy = httpProxy.createProxyServer(opts) as HttpProxy.Server

    proxy.on('error', (err) => {
        console.error('http proxy error: ' + err.stack, {
            timestamp: true,
            error: err
        })
    })

    if (opts.configure) {
        opts.configure(proxy, opts)
    }

    // clone before saving because http-proxy mutates the options
    proxies[context] = [proxy, { ...opts }]
})

export default defineEventHandler(async (event) => {
    await new Promise<void>((resolve, reject) => {
        const next = (err?: unknown) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        }

        const url = event.req.url!

        for (const context in proxies) {
            if (doesProxyContextMatchUrl(context, url)) {
                const [proxy, opts] = proxies[context]
                const options: HttpProxy.ServerOptions = {}

                if (opts.bypass) {
                    const bypassResult = opts.bypass(event.req, event.res, opts)
                    if (typeof bypassResult === 'string') {
                        event.req.url = bypassResult
                        console.debug('bypass: ' + event.req.url + ' -> ' + bypassResult)
                        return next()
                    } else if (isObject(bypassResult)) {
                        Object.assign(options, bypassResult)
                        console.debug('bypass: ' + event.req.url + ' use modified options: %O', options)
                        return next()
                    } else if (bypassResult === false) {
                        console.debug('bypass: ' + event.req.url + ' -> 404')
                        return event.res.end(404)
                    }
                }

                // @ts-ignore
                console.debug(event.req.url + ' -> ' + opts.target || opts.forward)

                if (opts.rewrite) {
                    event.req.url = opts.rewrite(event.req.url!)
                }

                proxy.web(event.req, event.res, options)
                return
            }
        }

        next()
    })
})

function isObject(value: unknown): value is Record<string, any> {
    return Object.prototype.toString.call(value) === '[object Object]'
}

function doesProxyContextMatchUrl(context: string, url: string): boolean {
    return (
        (context.startsWith('^') && new RegExp(context).test(url)) ||
        url.startsWith(context)
    )
}
`
}
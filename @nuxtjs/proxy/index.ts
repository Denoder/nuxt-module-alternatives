import type { Module } from '@nuxt/types'
import { createProxyMiddleware } from 'http-proxy-middleware'
import { defineNuxtModule, addServerMiddleware } from '@nuxt/kit'
import { HttpProxyOptions, getProxyEntries, NuxtProxyOptions } from './options'

declare module '@nuxt/types' {
    interface Configuration {
        proxy?: NuxtProxyOptions
    }
}

const CONFIG_KEY = 'proxy'

export default defineNuxtModule<Module>({
    meta: {
        name: '@nuxtjs/proxy',
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    setup(options: HttpProxyOptions, nuxt) {

        if (!nuxt.options.server || !nuxt.options.proxy) {
            return
        }

        // Defaults
        const defaults: HttpProxyOptions = {
            changeOrigin: true,
            ws: true,
            ...options
        }

        const proxyEntries = getProxyEntries(nuxt.options.proxy as NuxtProxyOptions, defaults)

        // Register middleware
        for (const proxyEntry of proxyEntries) {
            // https://github.com/chimurai/http-proxy-middleware
            addServerMiddleware({
                prefix: false, // http-proxy-middleware uses req.originalUrl
                handler: createProxyMiddleware(proxyEntry.context, proxyEntry.options)
            })
        }
    }
})
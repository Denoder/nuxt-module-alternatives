import { defineNuxtPlugin } from '#imports'
import { createInstance } from '@refactorjs/ofetch'

const httpInstance = (options) => {
    // Create new Fetch instance
    return createInstance(options, http)
}

export default defineNuxtPlugin(ctx => {
    // runtimeConfig
    const runtimeConfig = ctx.$config && ctx.$config.public.http || {}

    // Nuxt Options
    const nuxtOptions = JSON.parse('<%= JSON.stringify(options) %>')

    // baseURL
    const baseURL = process.client ? (runtimeConfig.browserBaseURL || runtimeConfig.browserBaseUrl || runtimeConfig.baseURL || runtimeConfig.baseUrl || nuxtOptions.browserBaseURL || '') : (runtimeConfig.baseURL || runtimeConfig.baseUrl || process.env._HTTP_BASE_URL_ || nuxtOptions.baseURL || '')

    // Defaults
    const defaults = {
        baseURL,
        retry: nuxtOptions.retry,
        timeout: process.server ? nuxtOptions.serverTimeout : nuxtOptions.clientTimeout,
        credentials: nuxtOptions.credentials,
        headers: nuxtOptions.headers,
    }

    if (nuxtOptions.proxyHeaders) {
        // Proxy SSR request headers
        if (process.server && ctx.ssrContext?.event.req && ctx.ssrContext?.event.req.headers) {
            const reqHeaders = { ...ctx.ssrContext.event.req.headers }
            for (const h of nuxtOptions.proxyHeadersIgnore) {
                delete reqHeaders[h]
            }

            defaults.headers = { ...reqHeaders, ...defaults.headers }
        }
    }

    if (process.server) {
        // Don't accept brotli encoding because Node can't parse it
        defaults.headers['accept-encoding'] = 'gzip, deflate'
    }

    const http = httpInstance(defaults)
    const useConflict = nuxtOptions.useConflict
    const providerName = useConflict ? 'fetch' : 'http'

    globalThis['$' + providerName] = http
    ctx.provide(providerName, http);
})

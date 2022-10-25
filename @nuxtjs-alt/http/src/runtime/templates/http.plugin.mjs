import { createInstance } from '@refactorjs/ofetch'
import { defineNuxtPlugin } from '#imports'

// Nuxt Options
const options = JSON.parse('<%= JSON.stringify(options) %>')

const httpInstance = (options) => {
    // Create new Fetch instance
    const instance = createInstance(options)
    '<% if (options.debug) { %>';debugInterceptor(instance);'<% } %>'

    return instance
}

'<% if (options.debug) { %>'
const debugInterceptor = http => {
    const log = (level, ...messages) => console[level]('[http]', ...messages)

    // request
    http.onRequest(config => {
        log('info', 'Request:', config)
        return config
    })

    http.onRequestError(error => {
        log('error', 'Request error:', error)
    })

    // response
    http.onResponse(res => {
        log('info', 'Response:', res)
        return res
    })

    http.onResponseError(error => {
        log('error', 'Response error:', error)
    })
}
'<% } %>'

export default defineNuxtPlugin(ctx => {
    // baseURL
    const baseURL = process.client ? options.browserBaseURL : options.baseURL

    // Defaults
    const defaults = {
        baseURL,
        retry: options.retry,
        timeout: process.server ? options.serverTimeout : options.clientTimeout,
        credentials: options.credentials,
        headers: options.headers,
    }

    if (options.proxyHeaders) {
        // Proxy SSR request headers
        if (process.server && ctx.ssrContext?.event?.req?.headers) {
            const reqHeaders = { ...ctx.ssrContext.event.req.headers }
            for (const h of options.proxyHeadersIgnore) {
                delete reqHeaders[h]
            }

            defaults.headers = { ...reqHeaders, ...defaults.headers }
        }
    }

    const http = httpInstance(defaults)

    if (!globalThis.$http) {
        globalThis.$http = http
    }

    return {
        provide: {
            http: http
        }
    }
})
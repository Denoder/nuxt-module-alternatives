import { defineNuxtPlugin } from '#imports'
'<% if (options.undici) { %>'
import { $fetch as http } from 'ohmyfetch/undici'
'<% } else { %>'
import { $fetch as http } from 'ohmyfetch'
'<% } %>'
import { defu } from 'defu'
import destr from 'destr'

class HttpInstance {
    constructor(defaults, $fetch = http) {
        this.httpDefaults = {
            hooks: {},
            ...defaults
        }

        this.$fetch = $fetch
    }

    getBaseURL() {
        return this.httpDefaults.baseURL
    }

    setBaseURL(baseURL) {
        this.httpDefaults.baseURL = baseURL
    }

    setHeader(name, value) {
        if (!value) {
            delete this.httpDefaults.headers[name];
        } else {
            this.httpDefaults.headers[name] = value
        }
    }

    setToken(token, type) {
        const value = !token ? null : (type ? type + ' ' : '') + token
        this.setHeader('Authorization', value)
    }

    #hook(name, fn) {
        if (!this.httpDefaults.hooks[name]) {
            this.httpDefaults.hooks[name] = []
        }
        this.httpDefaults.hooks[name].push(fn)
    }

    onRequest(fn) {
        this.#hook('onRequest', fn)
    }

    onResponse(fn) {
        this.#hook('onResponse', fn)
    }

    onRequestError(fn) {
        this.#hook('onRequestError', fn)
    }

    onResponseError(fn) {
        this.#hook('onResponseError', fn)
    }

    onError(fn) {
        this.onRequestError(fn)
        this.onResponseError(fn)
    }

    create(options) {
        const { retry, timeout, baseURL, headers } = this.httpDefaults

        return createHttpInstance(defu(options, { retry, timeout, baseURL, headers }))
    }
}

for (let method of ['get', 'head', 'delete', 'post', 'put', 'patch']) {
    HttpInstance.prototype[method] = async function (url, options) {
        const fetchOptions = { ...this.httpDefaults, ...options }

        if (/^https?/.test(url)) {
            delete fetchOptions.baseURL
        } else if (fetchOptions.baseURL && typeof url === 'string' && url.startsWith('/')) {
            // Prevents `$fetch` from throwing "`input` must not begin with a slash when using `baseURL`"
            url = url.slice(1)
        }

        try {
            const controller = new AbortController();
            const timeoutSignal = setTimeout(() => controller.abort(), fetchOptions.timeout);

            let instance = await this.$fetch.create({
                method: method,
                signal: controller.signal,
                ...fetchOptions
            })

            clearTimeout(timeoutSignal);

            return instance(url)
        } 
        catch (error) {
            // Try to fill error with useful data
            if (error.response) {
                error.statusCode = error.response.status
                try {
                    const text = await error.response.text()
                    error.response.text = () => Promise.resolve(text)
                    const json = destr(text)
                    error.response.json = () => Promise.resolve(json)
                    error.response.data = json
                } catch (_) { }
            }

            // Call onError hook
            if (fetchOptions.hooks.onError) {
                for (const fn of fetchOptions.hooks.onError) {
                    const res = fn(error)
                    if (res !== undefined) {
                        return res
                    }
                }
            }

            // Throw error
            throw error
        }
    }

    HttpInstance.prototype['$' + method] = function (url, options) {
        return this[method](url, options).then(response => (response && response.text) ? response.text() : response).then(body => destr(body))
    }
}

const createHttpInstance = options => {
    // Create new Fetch instance
    return new HttpInstance(options)
}

export default defineNuxtPlugin(ctx => {
    // runtimeConfig
    const runtimeConfig = ctx.$config && ctx.$config.public.http || {}

    // baseURL
    const baseURL = process.client ? (runtimeConfig.browserBaseURL || runtimeConfig.browserBaseUrl || runtimeConfig.baseURL || runtimeConfig.baseUrl || '<%= options.browserBaseURL %>' || '') : (runtimeConfig.baseURL || runtimeConfig.baseUrl || process.env._HTTP_BASE_URL_ || '<%= options.baseURL %>' || '')

    // Create fresh objects for all default header scopes
    const headers = JSON.parse('<%= JSON.stringify(options.headers) %>')

    // Defaults
    const defaults = {
        retry: '<%= options.retry %>',
        timeout: process.server ? '<%= options.serverTimeout %>' : '<%= options.clientTimeout %>',
        baseURL,
        headers
    }

    '<% if (options.proxyHeaders) { %>'
        // Proxy SSR request headers
        if (process.server && ctx.ssrContext.req && ctx.ssrContext.req.headers) {
            const reqHeaders = { ...ctx.ssrContext.req.headers }
            for (const h of '<%= options.proxyHeadersIgnore %>'.split(',')) {
                delete reqHeaders[h]
            }

            defaults.headers = { ...reqHeaders, ...defaults.headers }
        }
    '<% } %>'

    if (process.server) {
        // Don't accept brotli encoding because Node can't parse it
        defaults.headers['accept-encoding'] = 'gzip, deflate'
    }

    const http = createHttpInstance(defaults)
    const useConflict = '<% options.useConflict %>'
    const providerName = useConflict ? 'http' : 'fetch'

    globalThis['$' + providerName] = http
    ctx.provide(providerName, http);
})
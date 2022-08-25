import { defineNuxtPlugin } from '#imports'
'<% if (options.undici) { %>'
import { $fetch as http } from 'ohmyfetch/undici'
'<% } else { %>'
import { $fetch as http } from 'ohmyfetch'
'<% } %>'
import { InterceptorManager } from '#http/runtime'

class HttpInstance {
    #$fetch;
    #httpDefaults;
    interceptors;

    constructor(defaults, $instance = http) {
        this.#httpDefaults = {
            ...defaults
        }

        this.interceptors = {
            request: new InterceptorManager(),
            response: new InterceptorManager()
        }

        this.#$fetch = $instance
        this.#createMethods()
    }

    #createMethods() {
        for (const method of ['get', 'head', 'delete', 'post', 'put', 'patch', 'options']) {
            Object.assign(this, {
                ['$' + method]: async (url, options) => {
                    let config = {...this.getDefaults(), ...options}

                    if (typeof url === 'string' || url instanceof URL) {
                        config = config || {};
                        config.url = url;
                    } else {
                        config = url || {};
                    }

                    config.method = method

                    if (config && config.params) {
                        config.params = cleanParams(config.params)
                    }

                    if (/^https?/.test(url)) {
                        delete config.baseURL
                    }

                    const requestInterceptorChain = [];
                    let synchronousRequestInterceptors = true;

                    this.interceptors.request.forEach((interceptor) => {
                        if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
                            return;
                        }

                        synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

                        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
                    });

                    const responseInterceptorChain = [];
                    this.interceptors.response.forEach((interceptor) => {
                        responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
                    });

                    let promise;
                    let i = 0;
                    let len;

                    if (!synchronousRequestInterceptors) {
                        const chain = [this.#dispatchRequest.bind(this), undefined]
                        chain.unshift.apply(chain, requestInterceptorChain);
                        chain.push.apply(chain, responseInterceptorChain);
                        len = chain.length;

                        promise = Promise.resolve(config);

                        while (i < len) {
                            promise = promise.then(chain[i++], chain[i++]);
                        }

                        return promise;
                    }

                    len = requestInterceptorChain.length;

                    let newConfig = config;

                    i = 0;

                    while (i < len) {
                        const onFulfilled = requestInterceptorChain[i++];
                        const onRejected = requestInterceptorChain[i++];
                        try {
                            newConfig = await onFulfilled(newConfig);
                        } catch (error) {
                            onRejected.call(this, error);
                            break;
                        }
                    }

                    try {
                        promise = this.#dispatchRequest.call(this, newConfig)
                    } catch (error) {
                        return Promise.reject(error);
                    }

                    i = 0;
                    len = responseInterceptorChain.length;

                    while (i < len) {
                        promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
                    }

                    return promise;
                },
                [method]: (url, options) => {
                    options = { ...options, raw: true }
                    return this['$' + method](url, options)
                }
            })
        }
    }

    #dispatchRequest(config) {
        const controller = new AbortController();
        const timeoutSignal = setTimeout(() => controller.abort(), config.timeout);
        const $fetchInstance = this.getFetch()

        clearTimeout(timeoutSignal);

        if (config.raw) {
            return $fetchInstance.raw(config.url, {
                method: config.method,
                signal: controller.signal,
                ...config
            })
        }

        return $fetchInstance(config.url, {
            method: config.method,
            signal: controller.signal,
            ...config
        })

    }

    getFetch() {
        return this.#$fetch
    }

    getDefaults() {
        return this.#httpDefaults
    }

    getBaseURL() {
        return this.#httpDefaults.baseURL
    }

    setBaseURL(baseURL) {
        this.#httpDefaults.baseURL = baseURL
    }

    setHeader(name, value) {
        if (!value) {
            delete this.#httpDefaults.headers[name];
        } else {
            this.#httpDefaults.headers[name] = value
        }
    }

    setToken(token, type) {
        const value = !token ? null : (type ? type + ' ' : '') + token
        this.setHeader('Authorization', value)
    }

    onRequest(fn) {
        this.interceptors.request.use(config => fn(config) || config)
    }

    onResponse(fn) {
        this.interceptors.response.use(response => fn(response) || response)
    }

    onRequestError(fn) {
        this.interceptors.request.use(undefined, error => fn(error) || Promise.reject(error))
    }

    onResponseError(fn) {
        this.interceptors.response.use(undefined, error => fn(error) || Promise.reject(error))
    }

    create(options) {
        return createHttpInstance({ ...this.getDefaults(), ...options })
    }
}

const cleanParams = (obj) => {
    const cleanValues = [null, undefined, '']
    const cleanedObj = { ...obj };
    Object.keys(cleanedObj).forEach(key => {
        if (cleanValues.includes(cleanedObj[key]) || (Array.isArray(cleanedObj[key]) && !cleanedObj[key].length)) {
            delete cleanedObj[key];
        }
    });

    return cleanedObj;
}

const createHttpInstance = (options) => {
    // Create new Fetch instance
    return new HttpInstance(options)
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
        if (process.server && ctx.ssrContext.req && ctx.ssrContext.req.headers) {
            const reqHeaders = { ...ctx.ssrContext.req.headers }
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

    const http = createHttpInstance(defaults)
    const useConflict = nuxtOptions.useConflict
    const providerName = useConflict ? 'fetch' : 'http'

    globalThis['$' + providerName] = http
    ctx.provide(providerName, http);
})
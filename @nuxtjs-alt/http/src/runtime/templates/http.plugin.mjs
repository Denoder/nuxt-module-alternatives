import { defineNuxtPlugin } from '#imports'
'<% if (options.undici) { %>'
import { $fetch as http } from 'ohmyfetch/undici'
'<% } else { %>'
import { $fetch as http } from 'ohmyfetch'
'<% } %>'
import { defu } from 'defu'

class HttpInstance {
    #$fetch;
    #httpDefaults;

    constructor(defaults, $instance = http) {
        this.#httpDefaults = {
            interceptors: [],
            ...defaults
        }

        this.#$fetch = $instance
        this.#createMethods()
    }

    #createMethods() {
        for (let method of ['get', 'head', 'delete', 'post', 'put', 'patch', 'options']) {
            /**
             * Method Creations
             *
             * @param {*} url
             * @param {*} options
             * @returns
             */
            Object.assign(this.__proto__, {
                [method]: function (url, options) {
                    const fetchOptions = defu(options, this.getDefaults())
                    const interceptors = this.#httpDefaults.interceptors;

                    if (fetchOptions && fetchOptions.params) {
                        fetchOptions.params = cleanParams(options.params)
                    }

                    if (/^https?/.test(url)) {
                        delete fetchOptions.baseURL
                    }

                    const controller = new AbortController();
                    const timeoutSignal = setTimeout(() => controller.abort(), fetchOptions.timeout);
                    delete fetchOptions.method

                    let promise = Promise.resolve({ request: url, options: fetchOptions });

                    interceptors.forEach(({ onRequest, onRequestError }) => {
                        if (onRequest || onRequestError) {
                            promise = promise.then(onRequest, onRequestError);
                        }
                    });

                    promise = promise.then(context => {
                        const request = context && context.request ? context.request : url
                        const opt = context && options ? context.options : null

                        return this.getFetch().raw(request, {
                            method: method,
                            signal: controller.signal,
                            ...fetchOptions,
                            ...opt
                        })
                        .then(response => {
                            return response;
                        })
                        .catch(error => {
                            return Promise.reject(error);
                        });
                    });

                    interceptors.forEach(({ onResponse, onResponseError }) => {
                        if (onResponse || onResponseError) {
                            promise = promise.then(onResponse, onResponseError);
                        }
                    });

                    clearTimeout(timeoutSignal);
                    return promise
                },
                ['$' + method]: function (url, options) {
                    const fetchOptions = defu(options, this.getDefaults())
                    const interceptors = this.#httpDefaults.interceptors;

                    if (fetchOptions && fetchOptions.params) {
                        fetchOptions.params = cleanParams(options.params)
                    }

                    if (/^https?/.test(url)) {
                        delete fetchOptions.baseURL
                    }

                    const controller = new AbortController();
                    const timeoutSignal = setTimeout(() => controller.abort(), fetchOptions.timeout);
                    delete fetchOptions.method

                    let promise = Promise.resolve({ request: url, options: fetchOptions });

                    interceptors.forEach(({ onRequest, onRequestError }) => {
                        if (onRequest || onRequestError) {
                            promise = promise.then(onRequest, onRequestError);
                        }
                    });

                    promise = promise.then(context => {
                        const request = context && context.request ? context.request : url
                        const opt = context && options ? context.options : null

                        let instance = this.getFetch().create({
                            method: method,
                            signal: controller.signal,
                            ...fetchOptions,
                            ...opt
                        })

                        return instance(request).then(response => {
                            return response;
                        })
                        .catch(error => {
                            return Promise.reject(error);
                        });
                    });

                    interceptors.forEach(({ onResponse, onResponseError }) => {
                        if (onResponse || onResponseError) {
                            promise = promise.then(onResponse, onResponseError);
                        }
                    });

                    clearTimeout(timeoutSignal);
                    return promise
                }
            })
        }
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

    create(options) {
        const { retry, timeout, baseURL, headers, credentials } = this.getDefaults()
        return createHttpInstance(defu(options, { retry, timeout, baseURL, headers, credentials }))
    }

    interceptors(interceptor) {
        this.#httpDefaults.interceptors.push(interceptor);

        () => { 
            const index = this.#httpDefaults.interceptors.indexOf(interceptor);
            if (index >= 0) {
                this.#httpDefaults.interceptors.splice(index, 1);
            }
        }

        return this
    }

    clearInterceptors () {
        this.#httpDefaults.interceptors = [];
        return this
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

    // baseURL
    const baseURL = process.client ? (runtimeConfig.browserBaseURL || runtimeConfig.browserBaseUrl || runtimeConfig.baseURL || runtimeConfig.baseUrl || '<%= options.browserBaseURL %>' || '') : (runtimeConfig.baseURL || runtimeConfig.baseUrl || process.env._HTTP_BASE_URL_ || '<%= options.baseURL %>' || '')

    // Create fresh objects for all default header scopes
    const headers = JSON.parse('<%= JSON.stringify(options.headers) %>')

    // Defaults
    const defaults = {
        retry: '<%= options.retry %>',
        timeout: process.server ? '<%= options.serverTimeout %>' : '<%= options.clientTimeout %>',
        credentials: '<%= options.credentials %>',
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
    const useConflict = '<%= options.useConflict %>'
    const providerName = useConflict ? 'http' : 'fetch'

    globalThis['$' + providerName] = http
    ctx.provide(providerName, http);
})
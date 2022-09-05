import type { ModuleOptions } from './types'
import type { FetchInstance } from '@refactorjs/ofetch'
import { defineNuxtModule, addPluginTemplate, createResolver, addAutoImport } from '@nuxt/kit'
import { name, version } from '../package.json'

const CONFIG_KEY = 'http'

export * from './types'

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: '^3.0.0'
        },
    },
    defaults: {} as ModuleOptions,
    setup(opts, nuxt) {
        // Combine options
        const moduleOptions = {
            ...opts,
            ...(nuxt.options.runtimeConfig.public && nuxt.options.runtimeConfig.public[CONFIG_KEY])
        }

        // HTTPS
        const https = Boolean(nuxt.options.server && nuxt.options.server.https)

        // Support baseUrl alternative
        if (moduleOptions.baseUrl) {
            moduleOptions.baseURL = moduleOptions.baseUrl
            delete moduleOptions.baseUrl
        }
        if (moduleOptions.browserBaseUrl) {
            moduleOptions.browserBaseURL = moduleOptions.browserBaseUrl
            delete moduleOptions.browserBaseUrl
        }

        // Apply defaults
        const options: ModuleOptions = {
            baseURL: nuxt.options.app.baseURL,
            browserBaseURL: undefined,
            proxyHeaders: true,
            proxyHeadersIgnore: [
                'accept',
                'cf-connecting-ip',
                'cf-ray',
                'content-length',
                'content-md5',
                'content-type',
                'host',
                'if-modified-since',
                'if-none-match',
                'x-forwarded-host',
                'x-forwarded-port',
                'x-forwarded-proto'
            ],
            serverTimeout: 10000,
            clientTimeout: 25000,
            proxy: false,
            retry: false,
            undici: false,
            useConflict: false,
            https,
            headers: {},
            credentials: 'omit',
            ...moduleOptions
        }

        if (process.env.API_URL) {
            options.baseURL = process.env.API_URL
        }

        if (process.env.API_URL_BROWSER) {
            options.browserBaseURL = process.env.API_URL_BROWSER
        }

        if (typeof options.browserBaseURL === 'undefined') {
            options.browserBaseURL = options.proxy ? prefix : options.baseURL
        }

        // Convert http:// to https:// if https option is on
        if (options.https === true) {
            const https = (s: string) => s.replace('http://', 'https://')
            options.baseURL = https(options.baseURL)
            options.browserBaseURL = https(options.browserBaseURL)
        }

        // resolver
        const resolver = createResolver(import.meta.url)

        // Register plugin
        addPluginTemplate({
            src: resolver.resolve('runtime/templates/http.plugin.mjs'),
            filename: 'http.plugin.mjs',
            options: options
        })

        // Set _FETCH_BASE_URL_ for dynamic SSR baseURL
        process.env._HTTP_BASE_URL_ = options.baseURL

        console.debug(`baseURL: ${options.baseURL}`)
        console.debug(`browserBaseURL: ${options.browserBaseURL}`)

        // Add auto imports
        const composables = resolver.resolve('./runtime/composables')

        addAutoImport([
            { from: composables, name: options.useConflict ? 'useFetch' : 'useHttp' },
            { from: composables, name: options.useConflict ? 'useLazyFetch' : 'useLazyHttp' }
        ])
    }
})

declare module "#app" {
    export interface NuxtApp {
        $http: FetchInstance;
    }
    export interface NuxtOptions {
        http: ModuleOptions;
    }
}

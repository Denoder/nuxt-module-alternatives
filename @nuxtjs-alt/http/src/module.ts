import { name, version } from '../package.json'
import { defineNuxtModule, addPluginTemplate, createResolver, addAutoImport } from '@nuxt/kit'
import { ModuleOptions, NuxtHttpInstance } from './types'

const CONFIG_KEY = 'http'

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
    setup(_moduleOptions, nuxt) {
        // Combine options
        const moduleOptions: ModuleOptions = {
            ..._moduleOptions,
            ...(nuxt.options.runtimeConfig.public && nuxt.options.runtimeConfig.public[CONFIG_KEY])
        }

        // Default port
        const defaultPort =
            process.env.API_PORT ||
            moduleOptions.port ||
            process.env.PORT ||
            process.env.npm_package_config_nuxt_port ||
            (nuxt.options.server && nuxt.options.server.port) ||
            3000

        // Default host
        let defaultHost =
            process.env.API_HOST ||
            moduleOptions.host ||
            process.env.HOST ||
            process.env.npm_package_config_nuxt_host ||
            (nuxt.options.server && nuxt.options.server.host) ||
            'localhost'

        /* istanbul ignore if */
        if (defaultHost === '0.0.0.0') {
            defaultHost = 'localhost'
        }

        // Default prefix
        const prefix = process.env.API_PREFIX || moduleOptions.prefix || '/'

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
        const options = {
            baseURL: `http://${defaultHost}:${defaultPort}${prefix}`,
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

        /* istanbul ignore if */
        if (process.env.API_URL) {
            options.baseURL = process.env.API_URL
        }

        /* istanbul ignore if */
        if (process.env.API_URL_BROWSER) {
            options.browserBaseURL = process.env.API_URL_BROWSER
        }

        // Default browserBaseURL
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
            options
        })

        // Set _FETCH_BASE_URL_ for dynamic SSR baseURL
        process.env._HTTP_BASE_URL_ = options.baseURL

        console.debug(`baseURL: ${options.baseURL}`)
        console.debug(`browserBaseURL: ${options.browserBaseURL}`)

        const runtime = resolver.resolve("runtime");
        nuxt.options.alias["#http/runtime"] = runtime;

        // Add auto imports
        const composables = resolver.resolve('./runtime/composables')

        if (!options.useConflict) {
            addAutoImport([
                { from: composables, name: 'useHttp' },
                { from: composables, name: 'useLazyHttp' }
            ])
        } else {
            addAutoImport([
                { from: composables, name: 'useFetch' },
                { from: composables, name: 'useLazyFetch' }
            ])
        }
    }
})

declare module "#app" {
    export interface NuxtApp {
        $http: NuxtHttpInstance;
    }
    export interface NuxtOptions {
        http: NuxtHttpInstance;
    }
}
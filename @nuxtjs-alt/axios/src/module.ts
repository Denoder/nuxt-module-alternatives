import type { ModuleOptions } from './types'
import type { Nuxt } from '@nuxt/schema'
import { defineNuxtModule, addPluginTemplate, createResolver } from '@nuxt/kit'
import { name, version } from '../package.json'
import { defu } from 'defu'

const CONFIG_KEY = 'axios'

export * from './types'

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: '^3.0.0-rc.9'
        },
    },
    defaults: {} as ModuleOptions,
    setup(opts: ModuleOptions, nuxt: Nuxt) {
        // Combine options with runtime config
        const moduleOptions: ModuleOptions = defu(nuxt.options.runtimeConfig?.public[CONFIG_KEY], opts)

        // Default port
        const defaultPort = process.env.API_PORT || moduleOptions.port || process.env.PORT || process.env.npm_package_config_nuxt_port || 3000

        // Default host
        let defaultHost = process.env.API_HOST || moduleOptions.host || process.env.HOST || process.env.npm_package_config_nuxt_host || 'localhost'

        if (defaultHost === '0.0.0.0') {
            defaultHost = 'localhost'
        }

        // Default prefix
        const prefix = process.env.API_PREFIX || moduleOptions.prefix || '/'

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
        const options: ModuleOptions = defu(moduleOptions, {
            baseURL: `http://${defaultHost}:${defaultPort}${prefix}`,
            browserBaseURL: undefined,
            credentials: false,
            debug: false,
            progress: true,
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
            proxy: false,
            retry: false,
            https: false,
            headers: {
                common: {
                    accept: 'application/json, text/plain, */*'
                },
                delete: {},
                get: {},
                head: {},
                post: {},
                put: {},
                patch: {}
            },
        })

        if (process.env.API_URL) {
            options.baseURL = process.env.API_URL
        }

        if (process.env.API_URL_BROWSER) {
            options.browserBaseURL = process.env.API_URL_BROWSER
        }

        if (typeof options.browserBaseURL === 'undefined') {
            options.browserBaseURL = options.baseURL
        }

        // Normalize options
        if (options.retry === true) {
            options.retry = {}
        }

        // Convert http:// to https:// if https option is on
        if (options.https === true) {
            const https = (s: string) => s.replace('http://', 'https://')
            options.baseURL = https(options.baseURL)
            options.browserBaseURL = https(options.browserBaseURL)
        }

        // globalName
        options.globalName = nuxt.options.globalName || 'nuxt'

        // Set _AXIOS_BASE_URL_ for dynamic SSR baseURL
        process.env._AXIOS_BASE_URL_ = options.baseURL

        // resolver
        const resolver = createResolver(import.meta.url)

        // Register plugin
        addPluginTemplate({
            src: resolver.resolve('runtime/templates/axios.plugin.mjs'),
            options: options
        })

        console.debug(`baseURL: ${options.baseURL}`)
        console.debug(`browserBaseURL: ${options.browserBaseURL}`)
    }
})
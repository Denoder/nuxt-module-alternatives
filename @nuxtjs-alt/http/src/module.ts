import type { ModuleOptions } from './types'
import type { Nuxt } from '@nuxt/schema'
import { addTemplate, defineNuxtModule, addPluginTemplate, createResolver, addImports } from '@nuxt/kit'
import { name, version } from '../package.json'
import { defu } from 'defu'

const CONFIG_KEY = 'http'

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

        // Default host
        let defaultHost = moduleOptions.host || process.env.HOST || 'localhost'

        // Default port
        const defaultPort = moduleOptions.port || process.env.PORT || 3000

        if (defaultHost === '0.0.0.0') {
            defaultHost = 'localhost'
        }

        // Default prefix
        const prefix = moduleOptions.prefix || process.env.PREFIX || '/'

        // Support baseUrl alternative
        if (moduleOptions.baseUrl) {
            console.warn('baseUrl is deprecated please use baseURL instead.')
            moduleOptions.baseURL = moduleOptions.baseUrl
            delete moduleOptions.baseUrl
        }

        if (moduleOptions.browserBaseUrl) {
            console.warn('browserBaseUrl is deprecated please use browserBaseURL instead.')
            moduleOptions.browserBaseURL = moduleOptions.browserBaseUrl
            delete moduleOptions.browserBaseUrl
        }

        // Apply defaults
        const options: ModuleOptions = defu(moduleOptions, {
            baseURL: `http://${defaultHost}:${defaultPort}${prefix}`,
            browserBaseURL: undefined,
            proxyHeaders: true,
            proxyHeadersIgnore: [
                'accept',
                'connection',
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
            useConflict: false,
            https: false,
            retry: 1,
            headers: {
                accept: 'application/json, text/plain, */*'
            },
            credentials: 'omit',
            debug: false
        })

        if (typeof options.browserBaseURL === 'undefined') {
            options.browserBaseURL = options.baseURL
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

        addTemplate({
            getContents: () => getHttpDTS(),
            filename: 'http.plugin.d.ts',
            write: true,
        })

        // Add auto imports
        const composables = resolver.resolve('runtime/composables')

        addImports([
            { from: composables, name: options.useConflict ? 'useFetch' : 'useHttp' },
            { from: composables, name: options.useConflict ? 'useLazyFetch' : 'useLazyHttp' }
        ])
    }
})

function getHttpDTS() {
return `import type { Plugin } from '#app'
import { FetchInstance } from '@refactorjs/ofetch'

declare const _default: Plugin<{
    http: FetchInstance;
}>;

export default _default;
`
}
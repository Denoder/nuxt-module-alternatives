import type { ProxyServer, Server } from '@refactorjs/http-proxy'
import type { IncomingMessage, ServerResponse } from 'node:http'
import * as NuxtSchema from '@nuxt/schema';

export interface ModuleOptions {
    enableProxy?: boolean
    proxies?: {
        [key: string]: string | ProxyOptions
    }
    fetch?: boolean
}

export interface ProxyOptions extends Server.ServerOptions {
    /**
     * rewrite path
     */
    rewrite?: (path: string) => string | null | undefined | false

    /**
     * configure the proxy server (e.g. listen to events)
     */
    configure?: (proxy: ProxyServer, options: ProxyOptions) => void | null | undefined | false

    /**
     * webpack-dev-server style bypass function
     */
    bypass?: (
        req: IncomingMessage,
        res: ServerResponse,
        options: ProxyOptions
    ) => void | null | undefined | false | string
}

declare module '@nuxt/schema' {
    interface NuxtConfig {
        proxy?: ModuleOptions
    }
    interface NuxtOptions {
        proxy?: ModuleOptions
    }
    interface RuntimeConfig {
        proxy?: ModuleOptions;
    }
    interface PublicRuntimeConfig {
        proxy?: ModuleOptions
    }
}

declare const NuxtProxy: NuxtSchema.NuxtModule<ModuleOptions>

export default NuxtProxy
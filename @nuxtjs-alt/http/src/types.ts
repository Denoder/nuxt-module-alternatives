import { FetchConfig, FetchInstance } from '@refactorjs/ofetch'
import * as NuxtSchema from '@nuxt/schema';

export interface ModuleOptions extends Omit<FetchConfig, 'credentials'> {
    baseURL?: string;
    browserBaseURL?: string;
    host?: string;
    prefix?: string;
    proxyHeaders?: boolean;
    proxyHeadersIgnore?: string[];
    serverTimeout?: number,
    clientTimeout?: number,
    port?: string | number;
    https?: boolean;
    retry?: number;
    credentials?: string;
    headers?: any;
    debug?: boolean;
    interceptorPlugin?: boolean;
}

declare global {
    var $http: FetchInstance;
    namespace NodeJS {
        interface Global {
            $http: FetchInstance;
        }
    }
}

declare module '#app' {
    interface NuxtApp extends HttpPluginInjection {}
}

interface HttpPluginInjection {
    $http: FetchInstance;
}

declare module '@nuxt/schema' {
    interface NuxtConfig {
        http?: ModuleOptions
    }
    interface NuxtOptions {
        http?: ModuleOptions
    }
    interface RuntimeConfig {
        http?: ModuleOptions;
    }
    interface PublicRuntimeConfig {
        http?: ModuleOptions
    }
}

declare const NuxtHttp: NuxtSchema.NuxtModule<ModuleOptions>

export default NuxtHttp
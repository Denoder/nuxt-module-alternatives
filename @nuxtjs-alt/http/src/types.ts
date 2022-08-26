import type { OFetchInstance } from '@refactorjs/ofetch'

export interface NuxtHttpInstance extends OFetchInstance {

}

export interface ModuleOptions {
    baseURL?: string;
    baseUrl?: string;
    browserBaseURL?: string;
    browserBaseUrl?: string;
    host?: string;
    prefix?: string;
    proxyHeaders?: boolean;
    proxyHeadersIgnore?: string[];
    serverTimeout: number,
    clientTimeout: number,
    proxy?: boolean;
    port?: string | number;
    retry?: boolean;
    undici?: boolean;
    useConflict?: boolean;
    https?: boolean;
    headers?: any;
    credentials?: string;
}

declare module '@nuxt/schema' {
    export interface NuxtConfig {
        ['http']?: Partial<ModuleOptions>
    }
    export interface NuxtOptions {
        ['http']?: ModuleOptions
    }
}
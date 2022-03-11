import { IAxiosRetryConfig } from "axios-retry";
import "@nuxt/kit";

export interface ModuleOptions {
    baseURL?: string;
    baseUrl?: string;
    browserBaseURL?: string;
    browserBaseUrl?: string;
    globalName?: string;
    credentials?: boolean;
    debug?: boolean;
    host?: string;
    prefix?: string;
    progress?: boolean;
    proxyHeaders?: boolean;
    proxyHeadersIgnore?: string[];
    proxy?: boolean;
    port?: string | number;
    retry?: boolean | IAxiosRetryConfig;
    https?: boolean;
    headers?: {
        common?: Record<string, string>;
        delete?: Record<string, string>;
        get?: Record<string, string>;
        head?: Record<string, string>;
        post?: Record<string, string>;
        put?: Record<string, string>;
        patch?: Record<string, string>;
    };
}

import type { Strategy } from './strategy';
import type { NuxtPlugin } from '@nuxt/schema'

export interface ModuleOptions {
    globalMiddleware?: boolean;
    enableMiddleware?: boolean;
    plugins?: (NuxtPlugin | string)[];
    strategies?: {
        [strategy: string]: Strategy | false;
    };
    ignoreExceptions: boolean;
    resetOnError: boolean | ((...args: any[]) => boolean);
    defaultStrategy: string | undefined;
    watchLoggedIn: boolean;
    rewriteRedirects: boolean;
    fullPathRedirect: boolean;
    scopeKey: string;
    redirect: {
        login: string;
        logout: string;
        callback: string;
        home: string;
    };
    pinia: {
        namespace: string;
    };
    cookie:
        |   {
                prefix: string;
                options: {
                    path: string;
                    expires?: number | Date;
                    maxAge?: number;
                    domain?: string;
                    secure?: boolean;
                };
            }
        |   false;
    localStorage: { prefix: string; } | false;
    sessionStorage: { prefix: string; } | false;
    initialState?: {
        user: null;
        loggedIn: boolean;
        strategy?: string | null;
        busy?: boolean | null;
    };
}

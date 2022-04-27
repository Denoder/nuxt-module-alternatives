import type { Strategy } from "./types";

export interface ModuleOptions {
    globalMiddleware?: boolean;
    enableMiddleware?: boolean;
    plugins?: Array<string | { src: string; ssr: boolean }>;
    ignoreExceptions: boolean;
    resetOnError: boolean | ((...args: unknown[]) => boolean);
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
    localStorage:
        |   {
                prefix: string;
            }
        |   false;
    sessionStorage:
        |   {
                prefix: string;
            }
        |   false;
    strategies: {
        [strategy: string]: Strategy;
    };
}

export const moduleDefaults: ModuleOptions = {
    // -- Enable Global Middleware --
    globalMiddleware: false,

    enableMiddleware: true,

    // -- Error handling --

    resetOnError: false,

    ignoreExceptions: false,

    // -- Authorization --

    scopeKey: "scope",

    // -- Redirects --

    rewriteRedirects: true,

    fullPathRedirect: false,

    watchLoggedIn: true,

    redirect: {
        login: "/login",
        logout: "/",
        home: "/",
        callback: "/login",
    },

    //  -- Pinia Store --

    pinia: {
        namespace: "auth",
    },

    // -- Cookie Store --

    cookie: {
        prefix: "auth.",
        options: {
            path: "/",
        },
    },

    // -- localStorage Store --

    localStorage: {
        prefix: "auth.",
    },

    // -- sessionStorage Store --

    sessionStorage: {
        prefix: "auth.",
    },

    // -- Strategies --

    defaultStrategy: undefined /* will be auto set at module level */,

    strategies: {},
};

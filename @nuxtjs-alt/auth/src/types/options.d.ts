import type { Strategy } from "./strategy";

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
    initialState?: {
        user: null;
        loggedIn: boolean;
    };
}

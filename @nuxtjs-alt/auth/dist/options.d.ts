declare const moduleDefaults: {
    globalMiddleware: boolean;
    enableMiddleware: boolean;
    resetOnError: boolean;
    ignoreExceptions: boolean;
    scopeKey: string;
    rewriteRedirects: boolean;
    fullPathRedirect: boolean;
    watchLoggedIn: boolean;
    redirect: {
        login: string;
        logout: string;
        home: string;
        callback: string;
    };
    pinia: {
        namespace: string;
    };
    cookie: {
        prefix: string;
        options: {
            path: string;
        };
    };
    localStorage: {
        prefix: string;
    };
    sessionStorage: {
        prefix: string;
    };
    defaultStrategy: any;
    strategies: {};
};

export { moduleDefaults };

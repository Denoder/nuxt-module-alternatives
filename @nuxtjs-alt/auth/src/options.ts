export const moduleDefaults = {
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

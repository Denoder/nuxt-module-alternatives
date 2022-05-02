const moduleDefaults = {
  globalMiddleware: false,
  enableMiddleware: true,
  resetOnError: false,
  ignoreExceptions: false,
  scopeKey: "scope",
  rewriteRedirects: true,
  fullPathRedirect: false,
  watchLoggedIn: true,
  redirect: {
    login: "/login",
    logout: "/",
    home: "/",
    callback: "/login"
  },
  pinia: {
    namespace: "auth"
  },
  cookie: {
    prefix: "auth.",
    options: {
      path: "/"
    }
  },
  localStorage: {
    prefix: "auth."
  },
  sessionStorage: {
    prefix: "auth."
  },
  defaultStrategy: void 0,
  strategies: {}
};

export { moduleDefaults };

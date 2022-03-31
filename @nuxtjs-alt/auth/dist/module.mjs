import { existsSync } from 'fs';
import hash from 'hasha';
import fs from 'fs-extra';
import defu from 'defu';
import { createResolver, addServerMiddleware, resolvePath, requireModule, defineNuxtModule, addPluginTemplate } from '@nuxt/kit';

const name = "@nuxtjs-alt/auth";
const version = "1.1.5";

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
  defaultStrategy: void 0,
  strategies: {}
};

function assignDefaults(strategy, defaults) {
  Object.assign(strategy, defu(strategy, defaults));
}
function addAuthorize(nuxt, strategy, useForms = false) {
  const clientSecret = strategy.clientSecret;
  const clientID = strategy.clientId;
  const tokenEndpoint = strategy.endpoints.token;
  const audience = strategy.audience;
  delete strategy.clientSecret;
  const endpoint = `/_auth/oauth/${strategy.name}/authorize`;
  strategy.endpoints.token = endpoint;
  strategy.responseType = "code";
  const resolver = createResolver(nuxt.options.srcDir);
  const proxyDirectory = resolver.resolve("server/@auth");
  const filePath = proxyDirectory + `/addAuthorize.ts`;
  fs.outputFileSync(filePath, authorizeMiddlewareFile({
    strategy,
    useForms,
    clientSecret,
    clientID,
    tokenEndpoint,
    audience
  }));
  addServerMiddleware({
    route: endpoint,
    handle: filePath
  });
}
function initializePasswordGrantFlow(nuxt, strategy) {
  const clientSecret = strategy.clientSecret;
  const clientId = strategy.clientId;
  const tokenEndpoint = strategy.endpoints.token;
  delete strategy.clientSecret;
  const endpoint = `/_auth/${strategy.name}/token`;
  strategy.endpoints.login.url = endpoint;
  strategy.endpoints.refresh.url = endpoint;
  const resolver = createResolver(nuxt.options.srcDir);
  const proxyDirectory = resolver.resolve("server/@auth");
  const filePath = proxyDirectory + `/passwordGrant.ts`;
  fs.outputFileSync(filePath, passwordGrantMiddlewareFile({
    strategy,
    clientSecret,
    clientId,
    tokenEndpoint
  }));
  addServerMiddleware({
    route: endpoint,
    handle: filePath
  });
}
function assignAbsoluteEndpoints(strategy) {
  const { url, endpoints } = strategy;
  if (endpoints) {
    for (const key of Object.keys(endpoints)) {
      const endpoint = endpoints[key];
      if (endpoint) {
        if (typeof endpoint === "object") {
          if (!endpoint.url || endpoint.url.startsWith(url)) {
            continue;
          }
          endpoints[key].url = url + endpoint.url;
        } else {
          if (endpoint.startsWith(url)) {
            continue;
          }
          endpoints[key] = url + endpoint;
        }
      }
    }
  }
}
function authorizeMiddlewareFile(opt) {
  return `
import axios from 'axios'
import qs from 'querystring'
import bodyParser from 'body-parser'
import type { IncomingMessage, ServerResponse } from 'http'

// Form data parser
const formMiddleware = bodyParser.urlencoded({ extended: true })

export default async (req: IncomingMessage, res: ServerResponse) => {

    await new Promise<void>((resolve, reject) => {
        const next = (err?: unknown) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        }

        if (req.method !== 'POST') {
            return next()
        }
    
        formMiddleware(req, res, () => {
            const {
                code,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri = ${opt.strategy.redirectUri},
                response_type: responseType = ${opt.strategy.responseType},
                grant_type: grantType = ${opt.strategy.grantType},
                refresh_token: refreshToken
            } = req.body
    
            // Grant type is authorization code, but code is not available
            if (grantType === 'authorization_code' && !code) {
                return next()
            }
    
            // Grant type is refresh token, but refresh token is not available
            if (grantType === 'refresh_token' && !refreshToken) {
                return next()
            }
    
            let data: qs.ParsedUrlQueryInput | string = {
                client_id: ${opt.clientID},
                client_secret: ${opt.clientSecret},
                refresh_token: refreshToken,
                grant_type: grantType,
                response_type: responseType,
                redirect_uri: redirectUri,
                ${opt.audience},
                code_verifier: codeVerifier,
                code
            }
    
            const headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
    
            if (strategy.clientSecretTransport === 'authorization_header') {
                // @ts-ignore
                headers.Authorization = 'Basic ' + Buffer.from(${opt.clientID} + ':' + ${opt.clientSecret}).toString('base64')
                // client_secret is transported in auth header
                delete data.client_secret
            }
    
            if (useForms) {
                data = qs.stringify(data)
                headers['Content-Type'] = 'application/x-www-form-urlencoded'
            }
    
            axios
                .request({
                    method: 'post',
                    url: ${opt.tokenEndpoint},
                    data,
                    headers
                })
                .then((response) => {
                    res.end(JSON.stringify(response.data))
                })
                .catch((error) => {
                    res.statusCode = error.response.status
                    res.end(JSON.stringify(error.response.data))
                })
        })
    })
}
`;
}
function passwordGrantMiddlewareFile(opt) {
  return `
import axios from 'axios'
import requrl from 'requrl'
import bodyParser from 'body-parser'
import type { IncomingMessage, ServerResponse } from 'http'

// Form data parser
const formMiddleware = bodyParser.json()

export default async (req: IncomingMessage, res: ServerResponse) => {

    await new Promise<void>((resolve, reject) => {
        const next = (err?: unknown) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        }

        if (req.method !== 'POST') {
            return next()
        }
    
        formMiddleware(req, res, () => {
            const data = req.body

            // If \`grant_type\` is not defined, set default value
            if (!data.grant_type) {
                data.grant_type = ${opt.strategy.grantType}
            }

            // If \`client_id\` is not defined, set default value
            if (!data.client_id) {
                data.grant_type = ${opt.clientId}
            }

            // Grant type is password, but username or password is not available
            if (
                data.grant_type === 'password' &&
                (!data.username || !data.password)
            ) {
                return next(new Error('Invalid username or password'))
            }

            // Grant type is refresh token, but refresh token is not available
            if (data.grant_type === 'refresh_token' && !data.refresh_token) {
                return next(new Error('Refresh token not provided'))
            }

            axios
                .request({
                    method: 'post',
                    url: ${opt.tokenEndpoint},
                    baseURL: requrl(req),
                    data: {
                        client_id: ${opt.clientId},
                        client_secret: ${opt.clientSecret},
                        ...data
                    },
                    headers: {
                        Accept: 'application/json'
                    }
                })
                .then((response) => {
                    res.end(JSON.stringify(response.data))
                })
                .catch((error) => {
                    res.statusCode = error.response.status
                    res.end(JSON.stringify(error.response.data))
                })
        })
    })
}
`;
}

function auth0(nuxt, strategy) {
  const DEFAULTS = {
    scheme: "auth0",
    endpoints: {
      authorization: `https://${strategy.domain}/authorize`,
      userInfo: `https://${strategy.domain}/userinfo`,
      token: `https://${strategy.domain}/oauth/token`,
      logout: `https://${strategy.domain}/v2/logout`
    },
    scope: ["openid", "profile", "email"]
  };
  assignDefaults(strategy, DEFAULTS);
}

function discord(nuxt, strategy) {
  const DEFAULTS = {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://discord.com/api/oauth2/authorize",
      token: "https://discord.com/api/oauth2/token",
      userInfo: "https://discord.com/api/users/@me"
    },
    grantType: "authorization_code",
    codeChallengeMethod: "S256",
    scope: ["identify", "email"]
  };
  assignDefaults(strategy, DEFAULTS);
  addAuthorize(nuxt, strategy, true);
}

function facebook(nuxt, strategy) {
  const DEFAULTS = {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://facebook.com/v2.12/dialog/oauth",
      userInfo: "https://graph.facebook.com/v2.12/me?fields=about,name,picture{url},email"
    },
    scope: ["public_profile", "email"]
  };
  assignDefaults(strategy, DEFAULTS);
}

function github(nuxt, strategy) {
  const DEFAULTS = {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://github.com/login/oauth/authorize",
      token: "https://github.com/login/oauth/access_token",
      userInfo: "https://api.github.com/user"
    },
    scope: ["user", "email"]
  };
  assignDefaults(strategy, DEFAULTS);
  addAuthorize(nuxt, strategy);
}

function google(nuxt, strategy) {
  const DEFAULTS = {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://accounts.google.com/o/oauth2/auth",
      userInfo: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    scope: ["openid", "profile", "email"]
  };
  assignDefaults(strategy, DEFAULTS);
}

function laravelJWT(nuxt, strategy) {
  const { url } = strategy;
  if (!url) {
    throw new Error("url is required for laravel jwt!");
  }
  const DEFAULTS = {
    name: "laravelJWT",
    scheme: "laravelJWT",
    endpoints: {
      login: {
        url: url + "/api/auth/login"
      },
      refresh: {
        url: url + "/api/auth/refresh"
      },
      logout: {
        url: url + "/api/auth/logout"
      },
      user: {
        url: url + "/api/auth/user"
      }
    },
    token: {
      property: "access_token",
      maxAge: 3600
    },
    refreshToken: {
      property: false,
      data: false,
      maxAge: 1209600,
      required: false,
      tokenRequired: true
    },
    user: {
      property: false
    },
    clientId: false,
    grantType: false
  };
  assignDefaults(strategy, DEFAULTS);
  assignAbsoluteEndpoints(strategy);
}

function isPasswordGrant(strategy) {
  return strategy.grantType === "password";
}
function laravelPassport(nuxt, strategy) {
  const { url } = strategy;
  if (!url) {
    throw new Error("url is required is laravel passport!");
  }
  const defaults = {
    name: "laravelPassport",
    token: {
      property: "access_token",
      type: "Bearer",
      name: "Authorization",
      maxAge: 60 * 60 * 24 * 365
    },
    refreshToken: {
      property: "refresh_token",
      data: "refresh_token",
      maxAge: 60 * 60 * 24 * 30
    },
    user: {
      property: false
    }
  };
  if (isPasswordGrant(strategy)) {
    const _DEFAULTS = {
      ...defaults,
      scheme: "refresh",
      endpoints: {
        token: url + "/oauth/token",
        login: {
          baseURL: ""
        },
        refresh: {
          baseURL: ""
        },
        logout: false,
        user: {
          url: url + "/api/auth/user"
        }
      },
      grantType: "password"
    };
    assignDefaults(strategy, _DEFAULTS);
    assignAbsoluteEndpoints(strategy);
    initializePasswordGrantFlow(nuxt, strategy);
  } else {
    const _DEFAULTS = {
      ...defaults,
      scheme: "oauth2",
      endpoints: {
        authorization: url + "/oauth/authorize",
        token: url + "/oauth/token",
        userInfo: url + "/api/auth/user",
        logout: false
      },
      responseType: "code",
      grantType: "authorization_code",
      scope: "*"
    };
    assignDefaults(strategy, _DEFAULTS);
    assignAbsoluteEndpoints(strategy);
    addAuthorize(nuxt, strategy);
  }
}

function laravelSanctum(nuxt, strategy) {
  const endpointDefaults = {
    withCredentials: true,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  };
  const DEFAULTS = {
    scheme: "cookie",
    name: "laravelSanctum",
    cookie: {
      name: "XSRF-TOKEN",
      server: true
    },
    endpoints: {
      csrf: {
        ...endpointDefaults,
        url: `${strategy.url ? strategy.url : ""}/sanctum/csrf-cookie`
      },
      login: {
        ...endpointDefaults,
        url: `${strategy.url ? strategy.url : ""}/login`
      },
      logout: {
        ...endpointDefaults,
        url: `${strategy.url ? strategy.url : ""}/logout`
      },
      user: {
        ...endpointDefaults,
        url: `${strategy.url ? strategy.url : ""}/api/user`
      }
    },
    user: {
      property: {
        client: false,
        server: false
      },
      autoFetch: true
    },
    ...strategy
  };
  assignDefaults(strategy, DEFAULTS);
}

const ProviderAliases = {
  "laravel/jwt": "laravelJWT",
  "laravel/passport": "laravelPassport",
  "laravel/sanctum": "laravelSanctum"
};

const AUTH_PROVIDERS = {
    __proto__: null,
    ProviderAliases: ProviderAliases,
    auth0: auth0,
    discord: discord,
    facebook: facebook,
    github: github,
    google: google,
    laravelJWT: laravelJWT,
    laravelPassport: laravelPassport,
    laravelSanctum: laravelSanctum
};

const BuiltinSchemes = {
  local: "LocalScheme",
  cookie: "CookieScheme",
  oauth2: "Oauth2Scheme",
  openIDConnect: "OpenIDConnectScheme",
  refresh: "RefreshScheme",
  laravelJWT: "LaravelJWTScheme",
  auth0: "Auth0Scheme"
};
function resolveStrategies(nuxt, options) {
  const strategies = [];
  const strategyScheme = {};
  for (const name of Object.keys(options.strategies)) {
    if (!options.strategies[name] || options.strategies[name].enabled === false) {
      continue;
    }
    const strategy = Object.assign({}, options.strategies[name]);
    if (!strategy.name) {
      strategy.name = name;
    }
    if (!strategy.provider) {
      strategy.provider = strategy.name;
    }
    const provider = resolveProvider(strategy.provider);
    delete strategy.provider;
    if (typeof provider === "function") {
      provider(nuxt, strategy);
    }
    if (!strategy.scheme) {
      strategy.scheme = strategy.name;
    }
    const schemeImport = resolveScheme(strategy.scheme);
    delete strategy.scheme;
    strategyScheme[strategy.name] = schemeImport;
    strategies.push(strategy);
  }
  return {
    strategies,
    strategyScheme
  };
}
function resolveScheme(scheme) {
  if (typeof scheme !== "string") {
    return;
  }
  if (BuiltinSchemes[scheme]) {
    return {
      name: BuiltinSchemes[scheme],
      as: BuiltinSchemes[scheme],
      from: "#auth/runtime"
    };
  }
  const path = resolvePath(scheme);
  if (existsSync(path)) {
    const _path = path.replace(/\\/g, "/");
    return {
      name: "default",
      as: "Scheme$" + hash(_path).substr(0, 4),
      from: _path
    };
  }
}
function resolveProvider(provider) {
  if (typeof provider === "function") {
    return provider;
  }
  if (typeof provider !== "string") {
    return;
  }
  provider = ProviderAliases[provider] || provider;
  if (AUTH_PROVIDERS[provider]) {
    return AUTH_PROVIDERS[provider];
  }
  try {
    const m = requireModule(provider, { useESM: true });
    return m.default || m;
  } catch (e) {
  }
}

const getAuthPlugin = (options) => {
  return `
import { Auth, ExpiredAuthSessionError } from '#auth/runtime'
import { defineNuxtPlugin } from '#app'
// Active schemes
${options.schemeImports.map((i) => `import { ${i.name}${i.name !== i.as ? " as " + i.as : ""} } from '${i.from}'`).join("\n")}

export default defineNuxtPlugin(ctx => {

    // Options
    const options = ${JSON.stringify(options.options, null, 2)}

    // Create a new Auth instance
    const $auth = new Auth(ctx, options)

    // Register strategies
    ${options.strategies.map((strategy) => {
    const scheme = options.strategyScheme[strategy.name];
    const schemeOptions = JSON.stringify(strategy, null, 2);
    return `$auth.registerStrategy('${strategy.name}', new ${scheme.as}($auth, ${schemeOptions}));`;
  }).join(";\n")}

    ctx.provide('auth', $auth)

    return $auth.init().catch(error => {
        if (process.client) {
    
          // Don't console log expired auth session errors. This error is common, and expected to happen.
          // The error happens whenever the user does an ssr request (reload/initial navigation) with an expired refresh
          // token. We don't want to log this as an error.
          if (error instanceof ExpiredAuthSessionError) {
            return
          }
    
          console.error('[ERROR] [AUTH]', error)
        }
    })
})`;
};

const CONFIG_KEY = "auth";
const module = defineNuxtModule({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: "^3.0.0"
    }
  },
  defaults: moduleDefaults,
  setup(moduleOptions, nuxt) {
    const options = {
      ...moduleDefaults,
      ...moduleOptions
    };
    const resolver = createResolver(import.meta.url);
    const runtime = resolver.resolve("runtime");
    const utils = resolver.resolve("runtime/utils");
    nuxt.options.alias["#auth/utils"] = utils;
    nuxt.options.alias["#auth/runtime"] = runtime;
    const { strategies, strategyScheme } = resolveStrategies(nuxt, options);
    delete options.strategies;
    const _uniqueImports = /* @__PURE__ */ new Set();
    const schemeImports = Object.values(strategyScheme).filter((i) => {
      if (_uniqueImports.has(i.as))
        return false;
      _uniqueImports.add(i.as);
      return true;
    });
    options.defaultStrategy = options.defaultStrategy || strategies.length ? strategies[0].name : "";
    addPluginTemplate({
      getContents: () => getAuthPlugin({ options, strategies, strategyScheme, schemeImports }),
      filename: "auth.plugin.mjs"
    });
    if (options.enableMiddleware) {
      nuxt.hook("pages:middleware:extend", (middleware) => {
        middleware.push({
          name: "auth",
          path: resolver.resolve("runtime/core/middleware"),
          global: options.globalMiddleware
        });
      });
    }
    if (options.plugins) {
      options.plugins.forEach((p) => nuxt.options.plugins.push(p));
      delete options.plugins;
    }
  }
});

export { module as default };

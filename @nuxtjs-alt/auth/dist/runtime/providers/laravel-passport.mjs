import {
  assignDefaults,
  addAuthorize,
  initializePasswordGrantFlow,
  assignAbsoluteEndpoints
} from "../utils/provider";
function isPasswordGrant(strategy) {
  return strategy.grantType === "password";
}
export function laravelPassport(nuxt, strategy) {
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

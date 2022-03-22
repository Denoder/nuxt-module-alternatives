import { existsSync } from "fs";
import hash from "hasha";
import * as AUTH_PROVIDERS from "./providers/index.mjs";
import { ProviderAliases } from "./providers/index.mjs";
import { resolvePath, requireModule } from "@nuxt/kit";
const BuiltinSchemes = {
  local: "LocalScheme",
  cookie: "CookieScheme",
  oauth2: "Oauth2Scheme",
  openIDConnect: "OpenIDConnectScheme",
  refresh: "RefreshScheme",
  laravelJWT: "LaravelJWTScheme",
  auth0: "Auth0Scheme"
};
export function resolveStrategies(options) {
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
      provider(strategy);
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
export function resolveScheme(scheme) {
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
export function resolveProvider(provider) {
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

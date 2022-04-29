import { moduleDefaults } from './options.mjs';
import { resolveStrategies } from './resolve.mjs';
import { getAuthPlugin } from './plugin.mjs';
import { defineNuxtModule, createResolver, addPluginTemplate } from '@nuxt/kit';
import 'fs';
import 'hasha';
import 'fs-extra';
import 'defu';

const name = "@nuxtjs-alt/auth";
const version = "1.1.15";

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

import { defineNuxtModule, createResolver, addPluginTemplate, installModule } from '@nuxt/kit';

const name = "@nuxtjs-alt/axios";
const version = "1.0.7";

const CONFIG_KEY = "axios";
const module = defineNuxtModule({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: "^3.0.0"
    }
  },
  defaults: {},
  setup(_moduleOptions, nuxt) {
    const moduleOptions = {
      ..._moduleOptions,
      ...nuxt.options.runtimeConfig.public && nuxt.options.runtimeConfig.public[CONFIG_KEY]
    };
    const defaultPort = process.env.API_PORT || moduleOptions.port || process.env.PORT || process.env.npm_package_config_nuxt_port || nuxt.options.server && nuxt.options.server.port || 3e3;
    let defaultHost = process.env.API_HOST || moduleOptions.host || process.env.HOST || process.env.npm_package_config_nuxt_host || nuxt.options.server && nuxt.options.server.host || "localhost";
    if (defaultHost === "0.0.0.0") {
      defaultHost = "localhost";
    }
    const prefix = process.env.API_PREFIX || moduleOptions.prefix || "/";
    const https = Boolean(nuxt.options.server && nuxt.options.server.https);
    const headers = {
      common: {
        accept: "application/json, text/plain, */*"
      },
      delete: {},
      get: {},
      head: {},
      post: {},
      put: {},
      patch: {}
    };
    if (moduleOptions.baseUrl) {
      moduleOptions.baseURL = moduleOptions.baseUrl;
      delete moduleOptions.baseUrl;
    }
    if (moduleOptions.browserBaseUrl) {
      moduleOptions.browserBaseURL = moduleOptions.browserBaseUrl;
      delete moduleOptions.browserBaseUrl;
    }
    const options = {
      baseURL: `http://${defaultHost}:${defaultPort}${prefix}`,
      browserBaseURL: void 0,
      credentials: false,
      debug: false,
      progress: true,
      proxyHeaders: true,
      proxyHeadersIgnore: [
        "accept",
        "cf-connecting-ip",
        "cf-ray",
        "content-length",
        "content-md5",
        "content-type",
        "host",
        "if-modified-since",
        "if-none-match",
        "x-forwarded-host",
        "x-forwarded-port",
        "x-forwarded-proto"
      ],
      proxy: false,
      retry: false,
      https,
      headers,
      ...moduleOptions
    };
    if (process.env.API_URL) {
      options.baseURL = process.env.API_URL;
    }
    if (process.env.API_URL_BROWSER) {
      options.browserBaseURL = process.env.API_URL_BROWSER;
    }
    if (typeof options.browserBaseURL === "undefined") {
      options.browserBaseURL = options.proxy ? prefix : options.baseURL;
    }
    if (options.retry === true) {
      options.retry = {};
    }
    if (options.https === true) {
      const https2 = (s) => s.replace("http://", "https://");
      options.baseURL = https2(options.baseURL);
      options.browserBaseURL = https2(options.browserBaseURL);
    }
    options.globalName = nuxt.options.globalName || "nuxt";
    const resolver = createResolver(import.meta.url);
    addPluginTemplate({
      src: resolver.resolve("runtime/templates/axios.plugin.mjs"),
      filename: "axios.plugin.mjs",
      options
    });
    if (options.proxy || nuxt.options.proxy) {
      installModule("@nuxtjs-alt/proxy");
    }
    process.env._AXIOS_BASE_URL_ = options.baseURL;
    console.debug(`baseURL: ${options.baseURL}`);
    console.debug(`browserBaseURL: ${options.browserBaseURL}`);
  }
});

export { module as default };

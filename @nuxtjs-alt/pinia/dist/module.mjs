import { defineNuxtModule, createResolver, addPluginTemplate } from '@nuxt/kit';

const name = "@nuxtjs-alt/pinia";
const version = "1.0.7";

const CONFIG_KEY = "pinia";
const module = defineNuxtModule({
  meta: {
    name,
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: "^3.0.0"
    }
  },
  defaults: {
    storeName: "pinia"
  },
  async setup(moduleOptions, nuxt) {
    const options = {
      ...moduleOptions
    };
    const resolver = createResolver(import.meta.url);
    nuxt.hook("autoImports:extend", (autoImports) => {
      autoImports.push({
        name: "defineStore",
        as: "defineStore",
        from: "pinia"
      });
    });
    addPluginTemplate({
      src: resolver.resolve("runtime/templates/pinia.plugin.mjs"),
      fileName: "pinia.plugin.mjs",
      options
    });
  }
});

export { module as default };

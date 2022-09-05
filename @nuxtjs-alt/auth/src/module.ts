import type { ModuleOptions } from "./types";
import type { ImportOptions } from "./resolve";
import type { NuxtApp } from '@nuxt/schema';
import type { Nuxt } from '@nuxt/schema';
import { defineNuxtModule, addPluginTemplate, createResolver } from "@nuxt/kit";
import { name, version } from "../package.json";
import { resolveStrategies } from "./resolve";
import { moduleDefaults } from "./options";
import { getAuthPlugin } from "./plugin";
import { defu } from 'defu';

const CONFIG_KEY = "auth";

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: "^3.0.0-rc.9",
        },
    },
    defaults: moduleDefaults,
    async setup(moduleOptions: ModuleOptions, nuxt: Nuxt) {
        // Merge all option sources
        const options = defu(moduleOptions, moduleDefaults)

        // Resolver
        const resolver = createResolver(import.meta.url);

        // Aliases
        const runtime = resolver.resolve("runtime");
        nuxt.options.alias["#auth/runtime"] = runtime;

        // Resolve strategies
        const { strategies, strategyScheme } = await resolveStrategies(nuxt, options);
        // @ts-ignore
        delete options.strategies;

        // Resolve required imports
        const uniqueImports = new Set();
        const schemeImports = Object.values(strategyScheme).filter((i: ImportOptions) => {
            if (uniqueImports.has(i.as)) {
                return false;
            }

            uniqueImports.add(i.as);
            return true;
        });

        // Set defaultStrategy
        options.defaultStrategy = options.defaultStrategy || strategies.length ? strategies[0].name : "";

        // Add auth plugin
        addPluginTemplate({
            getContents: () => getAuthPlugin({ options, strategies, strategyScheme, schemeImports }),
            filename: "auth.plugin.mjs"
        });

        if (options.enableMiddleware) {
            nuxt.hook("app:resolve", (app: NuxtApp) => {
                app.middleware.push({
                    name: "auth",
                    path: resolver.resolve("runtime/core/middleware"),
                    global: options.globalMiddleware,
                });
            });
        }
    }
});
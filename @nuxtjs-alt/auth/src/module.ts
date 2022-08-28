import type { ModuleOptions } from "./types";
import { name, version } from "../package.json";
import { moduleDefaults } from "./options";
import { resolveStrategies } from "./resolve";
import { getAuthPlugin } from "./plugin";
import { defineNuxtModule, addPluginTemplate, createResolver } from "@nuxt/kit";

const CONFIG_KEY = "auth";

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: "^3.0.0",
        },
    },
    defaults: moduleDefaults,
    async setup(moduleOptions: ModuleOptions, nuxt: any) {
        // Merge all option sources
        const options: ModuleOptions = {
            ...moduleDefaults,
            ...moduleOptions,
        }

        // Resolver
        const resolver = createResolver(import.meta.url);

        // Aliases
        const runtime = resolver.resolve("runtime");
        nuxt.options.alias["#auth/runtime"] = runtime;

        // Resolve strategies
        const { strategies, strategyScheme } = await resolveStrategies(nuxt, options);
        delete options.strategies;

        // Resolve required imports
        const uniqueImports = new Set();
        const schemeImports = Object.values(strategyScheme).filter((i: any) => {
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
            nuxt.hook("app:resolve", (app: any) => {
                app.middleware.push({
                    name: "auth",
                    path: resolver.resolve("runtime/core/middleware"),
                    global: options.globalMiddleware,
                });
            });
        }

        // Extend auth with plugins
        if (options.plugins) {
            options.plugins.forEach((p: any) => nuxt.options.plugins.push(p));
            delete options.plugins;
        }
    }
});
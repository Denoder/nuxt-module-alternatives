import { name, version } from '../package.json'
import { defineNuxtModule, addPluginTemplate, createResolver } from "@nuxt/kit";
import type { Pinia } from 'pinia'

const CONFIG_KEY = 'pinia'

export interface ModuleOptions {
    storeName: string;
}

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: "^3.0.0",
        },
    },
    defaults: {
        storeName: "pinia",
    } as ModuleOptions,
    async setup(moduleOptions, nuxt) {
        // Merge all option sources
        const options = {
            ...moduleOptions
        };

        // resolver
        const resolver = createResolver(import.meta.url)

        // Register auto imports
        nuxt.hook('autoImports:extend', (autoImports) => {
            autoImports.push({
                name: 'defineStore',
                as: 'defineStore',
                from: 'pinia',
            })
        })

        // Add Pinia Plugin
        addPluginTemplate({
            src: resolver.resolve("runtime/templates/pinia.plugin.mjs"),
            fileName: "pinia.plugin.mjs",
            options,
        });
    },
});

declare module "#app" {
    export interface NuxtApp {
        $pinia: Pinia;
        pinia: Pinia;
    }
    export interface NuxtConfig {
        pinia: ModuleOptions;
    }
}

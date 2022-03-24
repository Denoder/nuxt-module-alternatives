import { name, version } from '../package.json'
import { moduleDefaults, ModuleOptions } from './options'
import { resolveStrategies } from './runtime/resolve'
import { defineNuxtModule, addPluginTemplate, createResolver } from '@nuxt/kit'
import type { Auth } from ".";
import defu from 'defu'

const CONFIG_KEY = 'auth'

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    defaults: moduleDefaults,
    setup(moduleOptions, nuxt) {
        // Merge all option sources
        const options: ModuleOptions = defu(
            moduleOptions,
            moduleDefaults
        )

        // resolver
        const resolver = createResolver(import.meta.url)

        // Resolve strategies
        const { strategies, strategyScheme } = resolveStrategies(nuxt, options)
        delete options.strategies

        // Resolve required imports
        const _uniqueImports = new Set()
        const schemeImports = Object.values(strategyScheme).filter((i) => {
            if (_uniqueImports.has(i.as)) return false
            _uniqueImports.add(i.as)
            return true
        })

        // Set defaultStrategy
        options.defaultStrategy = options.defaultStrategy || strategies.length ? strategies[0].name : ''

        // Add auth plugin
        addPluginTemplate({
            src: resolver.resolve('runtime/templates/auth.plugin.mjs'),
            fileName: 'auth.plugin.mjs',
            options: {
                options,
                strategies,
                strategyScheme,
                schemeImports
            }
        })

        // Extend auth with plugins
        if (options.plugins) {
            options.plugins.forEach((p: any) => nuxt.options.plugins.push(p))
            delete options.plugins
        }

        // Transpile and alias auth src
        const runtime = resolver.resolve('runtime/index')
        nuxt.options.alias['#auth/runtime'] = runtime
    }
})

declare module '@nuxt/schema' {
    interface NuxtConfig { 
        ['auth']?: Partial<ModuleOptions> 
    }
    interface NuxtOptions { 
        ['auth']?: ModuleOptions 
    }
}

declare module "#app" {
    interface NuxtApp {
        $auth: Auth;
    }
    interface NuxtConfig {
        auth: ModuleOptions;
    }
}
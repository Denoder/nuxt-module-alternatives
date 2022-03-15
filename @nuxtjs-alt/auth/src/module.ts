import { name, version } from '../package.json'
import { ModuleOptions, moduleDefaults } from './options'
import { resolveStrategies } from './resolve'
import { defineNuxtModule, addPluginTemplate, createResolver } from '@nuxt/kit'
import defu from 'defu'

const CONFIG_KEY = 'auth'

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        defaults: moduleDefaults,
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    setup(moduleOptions, nuxt) {
        // Merge all option sources
        const options: ModuleOptions = defu(
            moduleOptions,
            moduleDefaults
        )

        // resolver
        const resolver = createResolver(import.meta.url)

        // Resolve strategies
        /* @ts-ignore */
        const { strategies, strategyScheme } = resolveStrategies(options)
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
            /* @ts-ignore */
            src: resolver.resolve('runtime/templates/auth.plugin.mjs'),
            fileName: 'auth.plugin.mjs',
            options: {
                options,
                strategies,
                strategyScheme,
                schemeImports
            }
        })

        // Use nuxt hook to add middleware
        if (options.enableMiddleware) {
            nuxt.hook('pages:middleware:extend', middleware => {
                middleware.push({ name: 'auth', path: resolver.resolve('runtime/core/middleware'), global: false })
            })
        }

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
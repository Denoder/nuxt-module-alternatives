import { resolve, join } from 'path'
import { ModuleOptions, moduleDefaults } from './options'
import { resolveStrategies } from './resolve'
import { defineNuxtModule, addPluginTemplate } from '@nuxt/kit'
import defu from 'defu'

export default defineNuxtModule({
    meta: {
        name: '@nuxtjs/auth-next',
        configKey: 'auth',
        type: "module",
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    async setup(moduleOptions, nuxt) {
        // Merge all option sources
        const options: ModuleOptions = defu(
            moduleOptions,
            nuxt.options.auth,
            moduleDefaults
        )

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
            src: resolve(__dirname, 'templates/plugin.ts'),
            fileName: join('auth.mjs'),
            options: {
                options,
                strategies,
                strategyScheme,
                schemeImports
            }
        })

        // Use nuxt hook to add middleware
        nuxt.hook('pages:middleware:extend', middleware => {
            middleware.unshift({ name: 'auth', path: resolve(__dirname, 'core/middleware.ts'), global: false })
        })

        // Extend auth with plugins
        if (options.plugins) {
            options.plugins.forEach((p) => nuxt.options.plugins.push(p))
            delete options.plugins
        }

        // Transpile and alias auth src
        const runtime = resolve(__dirname, 'runtime')
        nuxt.options.alias['~auth/runtime'] = runtime
        //nuxt.options.build.transpile.push(__dirname)
    }
})
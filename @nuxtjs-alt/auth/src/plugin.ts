import { ImportOptions } from './resolve'
import { ModuleOptions, Strategy } from './types'

export const getAuthDTS = () => {
return `import type { Plugin } from '#app'
import { Auth } from '#auth/runtime'

declare const _default: Plugin<{
    auth: Auth;
}>;

export default _default;
`
}

export const getAuthPlugin = (options: {
    options: ModuleOptions
    schemeImports: ImportOptions[]
    strategies: Strategy[]
    strategyScheme: Record<string, ImportOptions>
}): string => {
    return `import { Auth, ExpiredAuthSessionError } from '#auth/runtime'
import { defineNuxtPlugin } from '#imports'
// Active schemes
${options.schemeImports.map((i) => `import { ${i.name}${i.name !== i.as ? ' as ' + i.as : ''} } from '${i.from}'`).join('\n')}

export default defineNuxtPlugin(nuxtApp => {
    // Options
    const options = ${JSON.stringify(options.options, null, 2)}

    // Create a new Auth instance
    const auth = new Auth(nuxtApp, options)

    // Register strategies
    ${options.strategies.map((strategy) => {
        const scheme = options.strategyScheme[strategy.name!]
        const schemeOptions = JSON.stringify(strategy, null, 2)
        return `auth.registerStrategy('${strategy.name}', new ${scheme.as}(auth, ${schemeOptions}));`
    }).join(';\n')}

    nuxtApp.provide('auth', auth)

    return auth.init().catch(error => {
        if (process.client) {
            // Don't console log expired auth session errors. This error is common, and expected to happen.
            // The error happens whenever the user does an ssr request (reload/initial navigation) with an expired refresh
            // token. We don't want to log this as an error.
            if (error instanceof ExpiredAuthSessionError) {
                return
            }
        
            console.error('[ERROR] [AUTH]', error)
        }
    })
})`
}

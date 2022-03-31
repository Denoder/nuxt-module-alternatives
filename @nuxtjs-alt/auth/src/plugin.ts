
export const getAuthPlugin = (options): string => {
return `
import { Auth, ExpiredAuthSessionError } from '#auth/runtime'
import { defineNuxtPlugin, useRouter } from '#app'
// Active schemes
${options.schemeImports.map(i => `import { ${i.name}${i.name !== i.as ? ' as ' + i.as : '' } } from '${i.from}'`).join('\n')}

export default defineNuxtPlugin(ctx => {
    const router = useRouter();
    router.beforeEach(async (to, from) => {
        console.log("beforeEach");
    })

    // Options
    const options = ${JSON.stringify(options.options, null, 2)}

    // Create a new Auth instance
    const $auth = new Auth(ctx, options)

    // Register strategies
    ${options.strategies.map((strategy) => {
        const scheme = options.strategyScheme[strategy.name]
        const schemeOptions = JSON.stringify(strategy, null, 2)
        return `$auth.registerStrategy('${strategy.name}', new ${scheme.as}($auth, ${schemeOptions}));`
    }).join(";\n")}

    ctx.provide('auth', $auth)

    return $auth.init().catch(error => {
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
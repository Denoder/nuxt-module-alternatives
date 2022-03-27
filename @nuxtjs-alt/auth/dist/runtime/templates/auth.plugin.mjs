import { Auth, ExpiredAuthSessionError, AuthMiddleware } from '#auth/runtime'
import { defineNuxtPlugin } from '#app'
// Active schemes
<%= options.schemeImports.map(i => `import { ${i.name}${i.name !== i.as ? ' as ' + i.as : '' } } from '${i.from}'`).join('\n') %>

export default defineNuxtPlugin(nuxtApp => {
    // Options
    const options = JSON.parse('<%= JSON.stringify(options.options) %>')

    // Create a new Auth instance
    const $auth = new Auth(nuxtApp, options)

    // Register strategies
    <%=
    options.strategies.map(strategy => {
        const scheme = options.strategyScheme[strategy.name]
        const schemeOptions = JSON.stringify(strategy, null, 2)
        return `// ${strategy.name}\n  $auth.registerStrategy('${strategy.name}', new ${scheme.as}($auth, ${schemeOptions}))`
    }).join('\n\n  ')
    %>

    try {
        nuxtApp.provide('auth', $auth.init())
    }
    catch (error) {
            if (process.client) {

            // Don't console log expired auth session errors. This error is common, and expected to happen.
            // The error happens whenever the user does an ssr request (reload/initial navigation) with an expired refresh
            // token. We don't want to log this as an error.
            if (error instanceof ExpiredAuthSessionError) {
                return
            }

            console.error('[ERROR] [AUTH]', error)
        }
    }
})

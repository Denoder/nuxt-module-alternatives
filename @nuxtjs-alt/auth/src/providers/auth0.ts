import type { ProviderOptions, ProviderPartialOptions } from '../type'
import type { Oauth2SchemeOptions } from '../runtime/schemes'
import { assignDefaults } from '../runtime/utils/provider'

export interface Auth0ProviderOptions
    extends ProviderOptions,
    Oauth2SchemeOptions {
    domain: string
}

export function auth0(
    strategy: ProviderPartialOptions<Auth0ProviderOptions>
): void {
    const DEFAULTS: typeof strategy = {
        scheme: 'auth0',
        endpoints: {
            authorization: `https://${strategy.domain}/authorize`,
            userInfo: `https://${strategy.domain}/userinfo`,
            token: `https://${strategy.domain}/oauth/token`,
            logout: `https://${strategy.domain}/v2/logout`
        },
        scope: ['openid', 'profile', 'email']
    }

    assignDefaults(strategy, DEFAULTS)
}

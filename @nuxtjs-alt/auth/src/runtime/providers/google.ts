import type { ProviderPartialOptions, ProviderOptions } from '../../type'
import type { Oauth2SchemeOptions } from '../schemes'
import { assignDefaults } from '../utils/provider'

export interface GoogleProviderOptions
    extends ProviderOptions,
    Oauth2SchemeOptions { }

export function google(
    nuxt: any,
    strategy: ProviderPartialOptions<GoogleProviderOptions>
): void {
    const DEFAULTS: typeof strategy = {
        scheme: 'oauth2',
        endpoints: {
            authorization: 'https://accounts.google.com/o/oauth2/auth',
            userInfo: 'https://www.googleapis.com/oauth2/v3/userinfo'
        },
        scope: ['openid', 'profile', 'email']
    }

    assignDefaults(strategy, DEFAULTS)
}

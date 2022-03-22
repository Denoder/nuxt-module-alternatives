import type { ProviderOptions, ProviderPartialOptions } from '../../type';
import type { Oauth2SchemeOptions } from '../schemes';
export interface Auth0ProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
    domain: string;
}
export declare function auth0(strategy: ProviderPartialOptions<Auth0ProviderOptions>): void;

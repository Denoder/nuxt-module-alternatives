import type { ProviderOptions, ProviderPartialOptions } from "../types";
import type { Oauth2SchemeOptions } from "../runtime";
export interface Auth0ProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
    domain: string;
}
export declare function auth0(nuxt: any, strategy: ProviderPartialOptions<Auth0ProviderOptions>): void;

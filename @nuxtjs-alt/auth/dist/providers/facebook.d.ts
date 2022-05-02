import type { ProviderPartialOptions, ProviderOptions } from "../types";
import type { Oauth2SchemeOptions } from "../runtime";
export interface FacebookProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
}
export declare function facebook(nuxt: any, strategy: ProviderPartialOptions<FacebookProviderOptions>): void;

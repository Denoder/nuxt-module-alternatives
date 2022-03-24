import type { ProviderPartialOptions, ProviderOptions } from '../../type';
import type { Oauth2SchemeOptions } from '../schemes';
export interface GoogleProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
}
export declare function google(nuxt: any, strategy: ProviderPartialOptions<GoogleProviderOptions>): void;

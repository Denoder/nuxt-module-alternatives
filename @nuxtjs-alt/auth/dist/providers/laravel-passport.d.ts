import type { ProviderPartialOptions, ProviderOptions } from "../types";
import type { Oauth2SchemeOptions, RefreshSchemeOptions } from "../runtime";
export interface LaravelPassportProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
    url: string;
}
export interface LaravelPassportPasswordProviderOptions extends ProviderOptions, RefreshSchemeOptions {
    url: string;
}
export declare type PartialPassportOptions = ProviderPartialOptions<LaravelPassportProviderOptions>;
export declare type PartialPassportPasswordOptions = ProviderPartialOptions<LaravelPassportPasswordProviderOptions>;
export declare function laravelPassport(nuxt: any, strategy: PartialPassportOptions | PartialPassportPasswordOptions): void;

import type { ProviderPartialOptions, ProviderOptions } from "../../type";
import type { Oauth2SchemeOptions, RefreshSchemeOptions } from "../schemes";
export interface LaravelPassportProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
    url: string;
}
export interface LaravelPassportPasswordProviderOptions extends ProviderOptions, RefreshSchemeOptions {
    url: string;
}
export declare type PartialPassportOptions = ProviderPartialOptions<LaravelPassportProviderOptions>;
export declare type PartialPassportPasswordOptions = ProviderPartialOptions<LaravelPassportPasswordProviderOptions>;
export declare function laravelPassport(nuxt: any, strategy: PartialPassportOptions | PartialPassportPasswordOptions): void;

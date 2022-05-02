import type { ProviderPartialOptions, ProviderOptions } from "../types";
import type { CookieSchemeOptions } from "../runtime";
export interface LaravelSanctumProviderOptions extends ProviderOptions, CookieSchemeOptions {
    url: string;
}
export declare function laravelSanctum(nuxt: any, strategy: ProviderPartialOptions<LaravelSanctumProviderOptions>): void;

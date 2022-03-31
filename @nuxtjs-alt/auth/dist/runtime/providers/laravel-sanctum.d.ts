import type { ProviderPartialOptions, ProviderOptions } from "../../types";
import type { CookieSchemeOptions } from "../schemes";
export interface LaravelSanctumProviderOptions extends ProviderOptions, CookieSchemeOptions {
    url: string;
}
export declare function laravelSanctum(nuxt: any, strategy: ProviderPartialOptions<LaravelSanctumProviderOptions>): void;

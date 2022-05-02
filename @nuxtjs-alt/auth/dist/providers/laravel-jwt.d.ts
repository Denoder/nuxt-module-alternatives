import type { ProviderPartialOptions, ProviderOptions } from "../types";
import type { RefreshSchemeOptions } from "../runtime";
export interface LaravelJWTProviderOptions extends ProviderOptions, RefreshSchemeOptions {
    url: string;
}
export declare function laravelJWT(nuxt: any, strategy: ProviderPartialOptions<LaravelJWTProviderOptions>): void;

import type { ProviderPartialOptions, ProviderOptions } from "../../type";
import type { RefreshSchemeOptions } from "../schemes";
export interface LaravelJWTProviderOptions extends ProviderOptions, RefreshSchemeOptions {
    url: string;
}
export declare function laravelJWT(nuxt: any, strategy: ProviderPartialOptions<LaravelJWTProviderOptions>): void;

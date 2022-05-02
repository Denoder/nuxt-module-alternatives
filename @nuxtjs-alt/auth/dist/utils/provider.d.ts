import type { StrategyOptions } from "../types";
import type { Oauth2SchemeOptions, RefreshSchemeOptions, LocalSchemeOptions, CookieSchemeOptions } from "../runtime";
export declare function assignDefaults<SOptions extends StrategyOptions>(strategy: SOptions, defaults: SOptions): void;
export declare function addAuthorize<SOptions extends StrategyOptions<Oauth2SchemeOptions>>(nuxt: any, strategy: SOptions, useForms?: boolean): void;
export declare function initializePasswordGrantFlow<SOptions extends StrategyOptions<RefreshSchemeOptions>>(nuxt: any, strategy: SOptions): void;
export declare function assignAbsoluteEndpoints<SOptions extends StrategyOptions<(LocalSchemeOptions | Oauth2SchemeOptions | CookieSchemeOptions) & {
    url: string;
}>>(strategy: SOptions): void;
export declare function authorizeMiddlewareFile(opt: any): string;
export declare function passwordGrantMiddlewareFile(opt: any): string;

import type { StrategyOptions } from '../../type';
import type { Oauth2SchemeOptions, RefreshSchemeOptions, LocalSchemeOptions, CookieScemeOptions } from '../schemes';
export declare function assignDefaults<SOptions extends StrategyOptions>(strategy: SOptions, defaults: SOptions): void;
export declare function addAuthorize<SOptions extends StrategyOptions<Oauth2SchemeOptions>>(nuxt: any, strategy: SOptions, useForms?: boolean): void;
export declare function initializePasswordGrantFlow<SOptions extends StrategyOptions<RefreshSchemeOptions>>(nuxt: any, strategy: SOptions): void;
export declare function assignAbsoluteEndpoints<SOptions extends StrategyOptions<(LocalSchemeOptions | Oauth2SchemeOptions | CookieScemeOptions) & {
    url: string;
}>>(strategy: SOptions): void;
export declare function authorizeMiddlewareFile(opt: any): string;
export declare function passwordGrantMiddlewareFile(opt: any): string;

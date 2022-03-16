import type { StrategyOptions } from '../../types';
import type { Oauth2SchemeOptions, RefreshSchemeOptions, LocalSchemeOptions, CookieScemeOptions } from '../schemes';
export declare function assignDefaults<SOptions extends StrategyOptions>(strategy: SOptions, defaults: SOptions): void;
export declare function addAuthorize<SOptions extends StrategyOptions<Oauth2SchemeOptions>>(strategy: SOptions, useForms?: boolean): void;
export declare function initializePasswordGrantFlow<SOptions extends StrategyOptions<RefreshSchemeOptions>>(strategy: SOptions): void;
export declare function assignAbsoluteEndpoints<SOptions extends StrategyOptions<(LocalSchemeOptions | Oauth2SchemeOptions | CookieScemeOptions) & {
    url: string;
}>>(strategy: SOptions): void;

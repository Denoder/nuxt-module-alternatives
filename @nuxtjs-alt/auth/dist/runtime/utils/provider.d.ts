import type { StrategyOptions } from '../../types';
import type { Oauth2SchemeOptions, RefreshSchemeOptions, LocalSchemeOptions } from '../schemes';
export declare function assignDefaults<SOptions extends StrategyOptions>(strategy: SOptions, defaults: SOptions): void;
export declare function addAuthorize<SOptions extends StrategyOptions<Oauth2SchemeOptions>>(nuxt: any, // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
strategy: SOptions, useForms?: boolean): void;
export declare function initializePasswordGrantFlow<SOptions extends StrategyOptions<RefreshSchemeOptions>>(nuxt: any, // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
strategy: SOptions): void;
export declare function assignAbsoluteEndpoints<SOptions extends StrategyOptions<(LocalSchemeOptions | Oauth2SchemeOptions) & {
    url: string;
}>>(strategy: SOptions): void;

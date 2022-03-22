import type { ProviderPartialOptions, ProviderOptions } from '../../type';
import type { CookieSchemeOptions } from '../schemes';
export interface LaravelSanctumProviderOptions extends ProviderOptions, CookieSchemeOptions {
    url: string;
}
export declare function laravelSanctum(strategy: ProviderPartialOptions<LaravelSanctumProviderOptions>): void;

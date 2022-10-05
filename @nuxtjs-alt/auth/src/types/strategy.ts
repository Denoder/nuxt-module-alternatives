import type { SchemeOptions } from "./scheme";
import type { ProviderPartialOptions, ProviderOptions } from "./provider";

export interface Strategy extends SchemeOptions {
    provider?: string | ((...args: any[]) => any);
    scheme?: string;
    enabled?: boolean;
    [option: string]: any;
}

export type StrategyOptions<SOptions extends SchemeOptions = SchemeOptions> = ProviderPartialOptions<ProviderOptions & SOptions>;

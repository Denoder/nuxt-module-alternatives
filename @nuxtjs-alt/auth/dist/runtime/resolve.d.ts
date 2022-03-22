import type { ModuleOptions } from '../options';
import type { Strategy } from '../type';
export interface ImportOptions {
    name: string;
    as: string;
    from: string;
}
export declare function resolveStrategies(options: ModuleOptions): {
    strategies: Strategy[];
    strategyScheme: Record<string, ImportOptions>;
};
export declare function resolveScheme(scheme: string): ImportOptions;
export declare function resolveProvider(provider: string | ((...args: unknown[]) => unknown)): (...args: unknown[]) => unknown;

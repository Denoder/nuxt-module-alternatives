import { M as ModuleOptions, S as Strategy } from './index.d-15ac4354.js';
import 'axios';
import '#app';
import '@nuxtjs-alt/axios';

interface ImportOptions {
    name: string;
    as: string;
    from: string;
}
declare function resolveStrategies(nuxt: any, options: ModuleOptions): {
    strategies: Strategy[];
    strategyScheme: Record<string, ImportOptions>;
};
declare function resolveScheme(scheme: string): ImportOptions;
declare function resolveProvider(provider: string | ((...args: unknown[]) => unknown)): (...args: unknown[]) => unknown;

export { ImportOptions, resolveProvider, resolveScheme, resolveStrategies };

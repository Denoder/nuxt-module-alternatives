import * as NuxtSchema from '@nuxt/schema';
import { Pinia } from 'pinia';

interface ModuleOptions {
    storeName: string;
}

declare const module: NuxtSchema.NuxtModule<ModuleOptions>;

declare module "#app" {
    export interface NuxtApp {
        $pinia: Pinia;
        pinia: Pinia;
    }
    export interface NuxtConfig {
        pinia: ModuleOptions;
    }
}

declare module '@nuxt/schema' {
    export interface NuxtConfig {
        ['pinia']?: Partial<ModuleOptions>;
    }
    export interface NuxtOptions {
        ['pinia']?: ModuleOptions;
    }
}

export { ModuleOptions, module as default };

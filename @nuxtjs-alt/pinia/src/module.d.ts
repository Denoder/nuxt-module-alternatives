import * as NuxtSchema from '@nuxt/schema';
import { Pinia } from 'pinia';

interface ModuleOptions {
    storeName: string;
}

declare const module: NuxtSchema.NuxtModule<ModuleOptions>;

declare module "#app" {
    interface NuxtApp {
        $pinia: Pinia;
        pinia: Pinia;
    }
    interface NuxtConfig {
        pinia: ModuleOptions;
    }
}

declare module '@nuxt/schema' {
    interface NuxtConfig {
        ['pinia']?: Partial<ModuleOptions>;
    }
    interface NuxtOptions {
        ['pinia']?: ModuleOptions;
    }
}

export { ModuleOptions, module as default };

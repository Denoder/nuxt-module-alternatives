import * as _nuxt_schema from '@nuxt/schema';
import { Pinia } from 'pinia';

interface ModuleOptions {
    storeName: string;
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions>;

declare module "#app" {
    interface NuxtApp {
        $pinia?: Pinia;
        pinia?: Pinia;
    }
    interface NuxtConfig {
        pinia: ModuleOptions;
    }
}

export { ModuleOptions, _default as default };

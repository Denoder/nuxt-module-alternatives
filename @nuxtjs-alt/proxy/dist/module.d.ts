import * as _nuxt_schema from '@nuxt/schema';

declare const _default: _nuxt_schema.NuxtModule<_nuxt_schema.ModuleOptions>;

declare module "#app" {
    interface NuxtConfig {
        proxy?: object;
    }
}

export { _default as default };

import type { Auth } from ".";
import { ModuleOptions } from "./options";
import * as NuxtSchema from '@nuxt/schema';

declare module '@nuxt/schema' {
    interface NuxtConfig {
        ['auth']?: Partial<ModuleOptions>;
    }
    interface NuxtOptions {
        ['auth']?: ModuleOptions;
    }
}

declare const module: NuxtSchema.NuxtModule<ModuleOptions>;

declare module "#app" {
    interface NuxtApp {
        $auth: Auth;
    }
    interface NuxtConfig {
        auth: ModuleOptions;
    }
}

export { module as default };
export * from ".";
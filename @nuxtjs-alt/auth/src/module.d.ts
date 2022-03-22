import type { Auth } from ".";
import { ModuleOptions } from "./options";
import * as NuxtSchema from '@nuxt/schema';

declare module '@nuxt/schema' {
    export interface NuxtConfig {
        ['auth']?: Partial<ModuleOptions>;
    }
    export interface NuxtOptions {
        ['auth']?: ModuleOptions;
    }
}

declare const module: NuxtSchema.NuxtModule<ModuleOptions>;

declare module "#app" {
    export interface NuxtApp {
        $auth: Auth;
    }
    export interface NuxtConfig {
        auth: ModuleOptions;
    }
}

export { module as default };
export * from ".";
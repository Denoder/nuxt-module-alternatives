import type { Auth } from "./runtime/index";
import { ModuleOptions } from "./options";

declare module "@nuxt/kit" {
    export interface NuxtApp {
        $auth?: Auth;
    }
    export interface NuxtConfig {
        auth?: ModuleOptions;
    }
}

export * from "./runtime/index";

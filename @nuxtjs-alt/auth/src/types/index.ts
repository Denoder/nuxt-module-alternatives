import type { ModuleOptions } from "./options";
import type { Auth } from "../runtime";
import * as NuxtSchema from '@nuxt/schema';

export * from "./openIDConnectConfigurationDocument";
export * from "./provider";
export * from "./request";
export * from "./router";
export * from "./scheme";
export * from "./strategy";
export * from "./utils";
export * from "./options";

declare module '#app' {
    interface NuxtApp extends AuthPluginInjection {}
}

interface AuthPluginInjection {
    $auth: Auth;
}

declare module "@nuxt/schema" {
    export interface NuxtConfig {
        auth?: Partial<ModuleOptions>;
    }
    export interface NuxtOptions {
        auth?: ModuleOptions;
    }
}

declare const NuxtAuth: NuxtSchema.NuxtModule<ModuleOptions>

export default NuxtAuth
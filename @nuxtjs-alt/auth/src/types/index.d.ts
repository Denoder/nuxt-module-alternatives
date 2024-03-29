import type { ModuleOptions } from "./options";
import * as NuxtSchema from '@nuxt/schema';

export * from "./openIDConnectConfigurationDocument";
export * from "./provider";
export * from "./request";
export * from "./router";
export * from "./scheme";
export * from "./strategy";
export * from "./utils";
export * from "./options";

declare const AuthModule: NuxtSchema.NuxtModule<ModuleOptions>;

declare module "@nuxt/schema" {
    export interface NuxtConfig {
        ["auth"]?: Partial<ModuleOptions>;
    }
    export interface NuxtOptions {
        ["auth"]?: ModuleOptions;
    }
}

export default AuthModule
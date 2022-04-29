import * as NuxtSchema from '@nuxt/schema';
import { Auth } from "../runtime";
import type { ModuleOptions } from "./options";

export * from "./openIDConnectConfigurationDocument";
export * from "./provider";
export * from "./request";
export * from "./router";
export * from "./scheme";
export * from "./strategy";
export * from "./utils";
export * from "./options";

declare const module: NuxtSchema.NuxtModule<ModuleOptions>;

declare module "@nuxt/schema" {
    interface NuxtConfig {
        ["auth"]?: Partial<ModuleOptions>;
    }
    interface NuxtOptions {
        ["auth"]?: ModuleOptions;
    }
}

declare module "#app" {
    interface NuxtApp {
        $auth: Auth;
    }
    interface NuxtConfig {
        auth: ModuleOptions;
    }
}

export { module as default };
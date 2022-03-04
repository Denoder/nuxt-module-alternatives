import "vue";
import type { ModuleOptions, Auth } from "./src/index";

export * from "./src/index";

declare module "@nuxt/kit" {
    interface NuxtApp {
        $auth: Auth;
    }
    interface NuxtConfig {
        auth: ModuleOptions;
    }
}

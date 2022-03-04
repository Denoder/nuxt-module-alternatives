import "vue";
import type { ModuleOptions, Auth } from ".";

declare module "@nuxt/kit" {
    interface NuxtApp {
        $auth: Auth;
    }
    interface NuxtConfig {
        auth: ModuleOptions;
    }
}

import { defineNuxtConfig } from "nuxt";
import Module from '..'

export default defineNuxtConfig({
    buildModules: [
        Module as any,
        "@nuxtjs-alt/http",
        "@pinia/nuxt",
    ],
    auth: {
        enableMiddleware: false,
    },
    imports: {
        autoImport: false
    },
});

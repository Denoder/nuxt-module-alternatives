import { defineNuxtConfig } from "nuxt";
import Module from '..'

export default defineNuxtConfig({
    buildModules: [
        Module,
        "@nuxtjs-alt/http",
        "@pinia/nuxt",
    ],
    auth: {
        enableMiddleware: false,
    }
});

import { defineNuxtConfig } from "nuxt";

export default defineNuxtConfig({
    buildModules: [
        "@nuxtjs-alt/auth",
        "@nuxtjs-alt/axios",
        "@pinia/nuxt",
    ],
    auth: {
        enableMiddleware: false,
    },
    vite: {
        server: {
            hmr: {
                clientPort: 443,
                path: "hmr/",
            },
        },
    },
});

import { defineNuxtConfig } from "nuxt3";

export default defineNuxtConfig({
    buildModules: [
        "@nuxtjs-alt/auth",
        "@nuxtjs-alt/axios",
        "@nuxtjs-alt/pinia",
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

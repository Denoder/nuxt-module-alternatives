import { defineNuxtConfig } from "nuxt3";

export default defineNuxtConfig({
    buildModules: [
        "@nuxtjs-alt/axios"
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

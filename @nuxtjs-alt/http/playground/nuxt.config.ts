import { defineNuxtConfig } from "nuxt";

export default defineNuxtConfig({
    buildModules: [
        "@nuxtjs-alt/http"
    ],
    vite: {
        server: {
            hmr: {
                clientPort: 443,
                path: "hmr/",
            },
        },
    },
});

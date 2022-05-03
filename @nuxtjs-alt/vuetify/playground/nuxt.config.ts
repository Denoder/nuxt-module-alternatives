import { defineNuxtConfig } from "nuxt";

export default defineNuxtConfig({
    buildModules: [
        "@nuxtjs-alt/vuetify"
    ],
    vuetify: {

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

import { defineNuxtConfig } from "nuxt";
import httpModule from '..'

export default defineNuxtConfig({
    buildModules: [
        httpModule
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

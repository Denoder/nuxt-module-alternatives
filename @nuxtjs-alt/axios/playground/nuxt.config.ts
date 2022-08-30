import { defineNuxtConfig } from "nuxt";
import axiosModule from '..'

export default defineNuxtConfig({
    buildModules: [
        axiosModule
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

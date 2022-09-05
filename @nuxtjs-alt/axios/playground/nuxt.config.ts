import { defineNuxtConfig } from "nuxt";
import axiosModule from '..'

export default defineNuxtConfig({
    modules: [
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

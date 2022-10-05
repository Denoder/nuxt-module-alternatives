import httpModule from '..'

export default defineNuxtConfig({
    bridge: false,
    buildModules: [
        httpModule
    ],
    http: {},
    vite: {
        server: {
            hmr: {
                clientPort: 443,
                path: "hmr/",
            },
        },
    },
});

import Module from '..'

export default defineNuxtConfig({
    modules: [
        Module,
        "@nuxtjs-alt/http",
        "@pinia/nuxt",
    ],
    auth: {
        enableMiddleware: false,
    }
});

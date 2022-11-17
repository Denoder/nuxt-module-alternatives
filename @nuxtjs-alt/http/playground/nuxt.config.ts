import httpModule from '..'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    modules: [
        httpModule,
    ],
    http: {
        interceptorPlugin: true
    }
});

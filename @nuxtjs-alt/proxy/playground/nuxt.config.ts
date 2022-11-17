import ProxyModule from '..'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    modules: [
        ProxyModule
    ],
    proxy: {
        proxies: {
            '/api': 'http://localhost:3001'
        }
    }
})

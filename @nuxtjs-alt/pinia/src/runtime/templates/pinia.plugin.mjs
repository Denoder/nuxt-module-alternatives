import { createPinia, setActivePinia } from 'pinia'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (nuxtApp) => {
    // Pinia Instance
    const pinia = createPinia()
    nuxtApp.vueApp.use(pinia)

    nuxtApp.provide('<%= options.storeName %>', pinia)
    nuxtApp['<%= options.storeName %>'] = pinia

    setActivePinia(pinia)

    // Hydrate state
    if (process.server) {
        nuxtApp.payload.state['<%= options.storeName %>'] = pinia.state.value
    }
    if (process.client && nuxtApp.payload.state['<%= options.storeName %>']) {
        pinia.state.value = nuxtApp.payload.state['<%= options.storeName %>']
    }
})
import { createPinia, setActivePinia } from 'pinia'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (context) => {
    // Pinia Instance
    const pinia = createPinia()
    context.vueApp.use(pinia)

    context.provide('<%= options.storeName %>', pinia)
    context['<%= options.storeName %>'] = pinia

    setActivePinia(pinia)

    pinia._p.push(({ store }) => {
        Object.defineProperty(store, '$nuxt', { value: context })
    })

    if (process.server) {
        context.payload['<%= options.storeName %>'] = pinia.state.value
    } 
    else if (context.payload && context.payload['<%= options.storeName %>']) {
        pinia.state.value = context.payload['<%= options.storeName %>']
    }
})

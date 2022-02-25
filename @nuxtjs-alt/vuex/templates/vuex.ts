import store from '<%= options.store %>'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (context) => {
    context.provide('<%= options.storeName %>', store)
    context['<%= options.storeName %>'] = store
})
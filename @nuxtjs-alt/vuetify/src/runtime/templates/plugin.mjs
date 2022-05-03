import { defineNuxtPlugin } from '#app'
import { createVuetify } from 'vuetify/framework'

const options = JSON.parse('<%= JSON.stringify(options) %>')

export default defineNuxtPlugin(nuxtApp => {
    const vuetify = createVuetify(options)

    nuxtApp.vueApp.use(vuetify)
})
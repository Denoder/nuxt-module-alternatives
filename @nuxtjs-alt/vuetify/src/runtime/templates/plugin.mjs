import { defineNuxtPlugin } from '#imports';
import { createVuetify } from '#vuetify';

const options = JSON.parse('<%= JSON.stringify(options) %>')

export default defineNuxtPlugin(nuxtApp => {
    const vuetify = createVuetify(options)
    nuxtApp.vueApp.use(vuetify)

    return {
        provide: {
            vuetify
        }
    }
})
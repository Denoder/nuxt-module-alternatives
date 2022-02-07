import { createStore } from 'vuex'
import { defineNuxtPlugin } from '#app'

let vuexStore = createStore({
    strict: (process.env.NODE_ENV !== 'production'),
    devtools: '<%= options.devtools %>',
})

const resolveStoreModules = (moduleData) => {
    moduleData = moduleData.default || moduleData

    Object.entries(moduleData).forEach(([name, storeData]) => {
        vuexStore.registerModule(name, storeData)
    });
}

export default defineNuxtPlugin(async context => {

    "<% options.storeModules.forEach(s => { if (s.src.indexOf('index.') === 0) { %>"
        resolveStoreModules(await import('<%= s.fullPath %>'))
    "<% }}) %>"

    context.vueApp.use(vuexStore)
    context.provide('<%= options.storeName %>', vuexStore)
    context['<%= options.storeName %>'] = vuexStore
})
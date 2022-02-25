import { useNuxtApp } from '#app'
import { toRaw, isReactive, isRef, toRef } from 'vue'
import { Store } from 'vuex'

export const vuexStore = (
options: {
    instance: Store,
    method: String,
    payload: String
}) => {
    const nuxt = useNuxtApp()
    const store = toRaw(options.instance ? options.instance : nuxt.$vuex)
    const state = toRef(nuxt.payload.state, options.payload ? options.payload : 'vuex')
    const refs = {}

    for (const key in store) {
        const value = store[key]
        if (isRef(value) || isReactive(value)) {
            refs[key] = toRef(store, key)
        }
    }

    if(state.value === undefined || options.method === 'update') {
        state.value = refs
    }

    return { state: state.value._state.data, store }
}

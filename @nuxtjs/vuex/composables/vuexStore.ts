import { useNuxtApp } from '#app'
import { toRaw, isReactive, isRef, toRef } from 'vue'

export const vuexStore = (key: String) => {
    const nuxt = useNuxtApp()
    const store = toRaw(nuxt['$' + (key ? key : 'vuex')])
    const state = toRef(nuxt.payload.state, '$' + (key ? key : 'vuex'))
    const refs = {}

    for (const key in store) {
        const value = store[key]
        if (isRef(value) || isReactive(value)) {
            refs[key] = toRef(store, key)
        }
    }

    if (state.value === undefined) {
        state.value = refs._state
    }

    return state.value.data
}

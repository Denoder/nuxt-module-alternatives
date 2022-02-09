import { useState, useNuxtApp } from '#app'
import { toRaw, isReactive, isRef, toRef } from 'vue'

export const vuexStore = (key: String) => {
    const nuxt = useNuxtApp()
    const store = toRaw(nuxt['$' + key ? key : 'vuex'])

    const refs = {}

    for (const key in store) {
        const value = store[key]
        if (isRef(value) || isReactive(value)) {
            refs[key] = toRef(store, key)
        }
    }

    return useState('vuexStore', () => refs._state).value.data
}

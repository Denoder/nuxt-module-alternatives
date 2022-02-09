import { useState, useNuxtApp } from '#app'
import { toRaw, isReactive, isRef, toRef } from 'vue'

export const vuexStore = () => {
    const { $vuex } = useNuxtApp()

    let store = toRaw($vuex)

    const refs = {}

    for (const key in store) {
        const value = store[key]
        if (isRef(value) || isReactive(value)) {
            refs[key] = toRef(store, key)
        }
    }

    return useState('vuexStore', () => refs._state).value.data
}

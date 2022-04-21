**Instructions**
This works a little bit differently from Nuxt 2. While I did try to retain the same essenece of it there are some major changes that had to be made. Firstly you are able to edit the store name, by default it is accessible via `$vuex` you can change this by altering the `storeName` property in your `vuex` config. You are also able to change the folder in which vuex will search for the store index, by default this is `store` you can change this via the `storeFolder` property. The file in the store folder must be an `index.js` or an `index.ts` file.

**Config Example**

```ts
import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    modules: [
        '@nuxtjs/vuex'
    ],
    vuex: {
        storeFolder: 'store',
        storeName: 'vuex',
    }
})
```

**index.js format**

You will need to create an index.js file with the createStore function from vuex

```ts
import { createStore } from 'vuex'
import main from "./main";

export default createStore({
    strict: (process.env.NODE_ENV !== 'production'),
    modules: {
        auth: {
            namespaced: true,
            state: () => ({
                user: {},
            }),
            mutations: {
                setUser(state, user) {
                    state.user = user;
                }
            },
            getters: {
                user(state) {
                    return state.user;
                }
            }
        },
        main
    },
})
```

**Composable**

There is a new composable added that you can use to handle SSR,
pass your vuex instance to the composable to utilize it: `const { store, state } = vuexStore({ instance: $vuex })`

```ts
const { $vuex } = useNuxtApp()
const { store, state } = vuexStore({ instance: $vuex })

state.auth.user // user: {}
```


`store.commit()`

`store.dispatch()`

etc...

to update after hydration

`const { store, state } = vuexStore({ method: 'update' })`

**Depenencies Needed:**
- vuex 4.x+
- @nuxt/kit
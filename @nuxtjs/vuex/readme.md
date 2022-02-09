**Depenencies Needed:**
- vuex 4.x+
- @nuxt/kit

**Instructions**
This works a little bit differently from Nuxt 2. While I did try to retain the same essenece of it there are some changes made. Firstly you are able to edit the store name, by default it is accessible via `$vuex` you can change this by altering the `storeName` property in your `vuex` config. You are also able to change the folder in which vuex will search for the store index, by default this is `store` you can change this via the `storeFolder` property. The file in the store folder must be an `index.js` or an `index.ts` file.

Please note that if you are using the `@nuxtjs/auth` module from this repository then the `storeName` property must be set to `vuex`

Config

```ts
import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    buildModules: [
        '@nuxtjs/vuex'
    ],
    vuex: {
        storeFolder: 'store',
        storeName: 'vuex',
    }
})
```

**index.js format**

You will need to create an index.js file wirth the createStore function from vuex

```ts
import { createStore } from 'vuex'
import main from "./main";

export default createStore({
    strict: (process.env.NODE_ENV !== 'production'),
    modules: {
        auth: {
            namespaced: true,
            state: () => ({
                user: null,
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

There is a new composable added that you can use to handle SSR, so to get the store values after mutation you would do:

```ts
const store = vuexStore()

store.auth.user // user: null
```
use your regular `$vuex` provider to commit and dispatch, and use the composable to get the mutations. If you have renamed the storeName pass the the storeName to the `vuexStore()` function like this: `vuexStore('store')`

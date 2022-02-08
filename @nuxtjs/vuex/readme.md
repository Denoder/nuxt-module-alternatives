**Depenencies Needed:**
- glob
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
        devtools: false
    }
})
```

**index.js format**

The store has a already been inititalized so all you need to do is export a default object with the stores you want to use.

```ts
import main from "./main";

export default {
    counter: {
        namespaced: false,
        state: () => ({
            count: 0
        }),
        mutations: {
            increment(state) {
                // `state` is the local module state
                state.count++
            }
        },
        getters: {
            doubleCount(state) {
                return state.count * 2
            }
        }
    },
    main
}
```

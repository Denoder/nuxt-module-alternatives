**Information**

This serves as an extension to ohmyfetch for nuxt. Please note this is only for nuxt3.
This works similar to nuxt/http and nuxtjs-alt/axios except it utilizes ohmyfetch. All property options will be under `http`

**Other Information**

If you want to experiment you may use the `useConflict: true` property to change `$http` to `$fetch`, the `useHttp` and `useLazyHttp` will turn into `useFetch` and `useLazyFetch` and `globalThis.$fetch` will be overrided with this module (`globalThis.$http` is also available). Remember this is a mix of `ohmyfetch` and `nuxt/http` so to use methods you would use eg. `$fetch.$get() | $http.$get()` or `$fetch.get() | $http.get()` all options relative to `ohmyfetch` can be registered as a secondary parameter within the method.

**Depenencies Needed:**
- ohmyfetch
- defu
- destr
- @nuxt/kit
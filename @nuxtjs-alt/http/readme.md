**Information**

This serves as an extension to ohmyfetch for nuxt. Please note this is only for nuxt3.
This works similar to nuxt/http and nuxtjs-alt/axios except it utilizes ohmyfetch. All property options will be under `http`

**Other Information**

If you want to experiment you may use the `useConflict: true` property to change `$http`, `useHttp`, `useLazyHttp`, `globalThis.$http`, to `$fetch`, `useFetch`, `useLazyFetch`, `globalThis.$fetch`.

Remember this is a mix of `ohmyfetch` and `nuxt/http` so to use methods you would use eg. `$fetch.$get(<url>, <options>) | $http.$get(<url>, <options>)` or `$fetch.get(<url>, <options>) | $http.get(<url>, <options>)` all options relative to `ohmyfetch` can be registered as a secondary parameter within the method.

Using the `$` (eg. `$http.$get()`) syntax will use `$fetch.create()` while the regular syntax will use `$fetch.raw()`.

**Interceptors**

The interceptors should work exactly like how axios has it so to access them you would use:

```ts
$http.interceptors.request.use()
$http.interceptors.response.use()

```

@nuxtjs-axios based functions have also been added:

```ts
$http.onRequest()
$http.onResponse()
$http.onRequestError()
$http.onResponseError()
$http.onError()
```

Please do tell me if you encounter any bugs.
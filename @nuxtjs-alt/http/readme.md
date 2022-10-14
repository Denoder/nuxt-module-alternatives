**Information**

This serves as an extension to ohmyfetch for nuxt. Please note this is only for nuxt3.
This works similar to nuxt/http and nuxtjs-alt/axios except it utilizes ohmyfetch. All property options will be under `http`

Remember this is a mix of `ohmyfetch` and `nuxt/http` so to use methods you would use as an example:

```ts
// Available methods: 'get', 'head', 'delete', 'post', 'put', 'patch', 'options'
// $http.$get('/api') is the same as $fetch('/api', { method: 'get' })
await $http.$get('/api', options)

// Access Raw Response
// $http.get('/api') is the same as $fetch.raw('/api', { method: 'get' })
await $http.get('/api', options)
```

**Interceptors**

The interceptors should work exactly like how axios has it so to access them you would use:

```ts
$http.interceptors.request.use(config)
$http.interceptors.response.use(config)

```

@nuxtjs-axios based functions have also been added:

```ts
$http.onRequest(config)
$http.onResponse(response)
$http.onRequestError(err)
$http.onResponseError(err)
$http.onError(err)
```

**Config Options**

```ts
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
    modules: [
        '@nuxtjs-alt/http',
    ],
    http: {
      
    }
})
```

Please do tell me if you encounter any bugs.
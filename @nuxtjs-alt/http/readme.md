**Information**

This serves as an extension to ohmyfetch for nuxt. Please note this is only for nuxt3.
This works similar to nuxt/http and nuxtjs-alt/axios except it utilizes ohmyfetch. All property options will be under `http`.
This module is required in order for `@nuxtjs-alt/auth` to function.

Remember this is a mix of `ohmyfetch` and `nuxt/http` so to use methods you would use as an example:

```ts
// Available methods: 'get', 'head', 'delete', 'post', 'put', 'patch', 'options'

// $http.$get('/api') $http.$get({ url: '/api' }) is the same as $fetch('/api', { method: 'get' })
await $http.$get('/api', options)
await $http.$get({ url: '/api', ...options })

// Access Raw Response
// $http.get('/api') and $http.get({ url: '/api' }) is the same as $fetch.raw('/api', { method: 'get' })
await $http.get('/api', options)
await $http.get({ url: '/api', ...options })
```

A `useHttp` composable is avaialble, it works like `useFetch` except uses this module under the hood

**Interceptors**

The interceptors should work exactly like how axios has it so to access them you would use:

```ts
$http.interceptors.request.use(config)
$http.interceptors.response.use(response)

```

A `interceptorPlugin` property has been added. This relies on the proxy module being present and will proxy urls based on the target for the client.

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
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    modules: [
        '@nuxtjs-alt/http',
    ],
    http: {
        baseURL: 'localhost:3000', // default is localhost:3000, otherwise it is the HOST/NITRO_HOST and PORT/NITRO_PORT enviromental values
        browserBaseURL: undefined, // default is nuxt app baseURL, otherwise if interceptorPlugin is enabled it's based on the proxy urls
        proxyHeaders: true,
        proxyHeadersIgnore: [
            'accept',
            'connection',
            'cf-connecting-ip',
            'cf-ray',
            'content-length',
            'content-md5',
            'content-type',
            'host',
            'if-modified-since',
            'if-none-match',
            'x-forwarded-host',
            'x-forwarded-port',
            'x-forwarded-proto'
        ],
        serverTimeout: 10000,
        clientTimeout: 25000,
        https: false,
        retry: 1,
        headers: {
            accept: 'application/json, text/plain, */*'
        },
        credentials: 'omit',
        debug: false,
        interceptorPlugin: false
    }
})
```

Please do tell me if you encounter any bugs.
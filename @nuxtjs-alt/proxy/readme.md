**Information**

This serves as an alternative for @nuxtjs-alt/proxy. Please note that his is for nuxt3 only.

**Other Information**

This module creates a file in your `buildDir` called `nuxt-http-proxy.ts` which will handle all of the proxying you set within your nuxt config. The config is similar to what vite has except that this one creates a physical file which is needed for production.

**Version 2.0+**
New options have been added to the proxy module. The proxies now need to be moved into a `proxies` property (example provided below). A `fetch` property has been added so that proxying applies to the native `$fetch` in nitro and via client side. An `enableProxy` property has been added if you would like to disable the `http-proxy` creation for some reason.

**Configuration**

The configuration looks similar to that of vite's server proxy config, only difference is that it's passed through to nuxt server handler.

```ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    modules: [
        '@nuxtjs-alt/proxy',
    ],
    proxy: {
        enableProxy: true,
        proxies: {
            // string shorthand
            '/foo': 'http://localhost:4567',
            // with options
            '/api': {
                target: 'http://jsonplaceholder.typicode.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            // with RegEx
            '^/fallback/.*': {
                target: 'http://jsonplaceholder.typicode.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/fallback/, '')
            },
            // Using the proxy instance
            '/api': {
                target: 'http://jsonplaceholder.typicode.com',
                changeOrigin: true,
                configure: (proxy, options) => {
                    // proxy will be an instance of 'http-proxy'
                }
            },
            // Proxying websockets or socket.io
            '/socket.io': {
                target: 'ws://localhost:5173',
                ws: true
            }
        },
        fetch: true
    }
})

```
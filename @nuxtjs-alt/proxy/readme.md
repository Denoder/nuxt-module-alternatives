**Information**

This serves as an alternative for @nuxtjs-alt/proxy. Please note that his is for nuxt3 only.

**Other Information**

This module creates a file in your `buildDir`  called `proxyServer.ts` which will handle all of the proxying you set within your nuxt config. The config is similar to what vite has except that this one creates a physical file which is needed for production.

**Configuration**

The configuration looks similar to that of vite's server proxy config, only difference is that it's passed through to nuxt server handler.

```ts
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
    modules: [
        '@nuxtjs-alt/proxy',
    ],
    proxy: {
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
    }
})

```

**Depenencies Needed:**
- http-proxy
- @nuxt/kit
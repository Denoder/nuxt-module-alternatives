**Information**

This serves as an alternative for @nuxtjs-alt/proxy. Please note that his is for nuxt3 only.

**Other Information**

This module creates a folder in your `srcDir` (project folder) inside `server/middleware` called `@proxy` and will contain a single file called `proxy.ts` which will handle all of the proxying you set within your nuxt config. The config is similar to what vite has except that this one creates a physical file which is needed for production.

**Depenencies Needed:**
- http-proxy
- @nuxt/kit
- fs-extra
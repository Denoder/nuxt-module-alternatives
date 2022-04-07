**Information**

This serves as an alternative for @nuxtjs-alt/proxy. Please note that his is for nuxt3 only.

**Other Information**

This module creates a folder in your `srcDir` (project folder) inside `server/middleware` called `@proxy` and for each proxy entry in your nuxt options creates a file called `proxy-<index>.ts` with `index` being the placement within that proxy object. The files are auto-generated. This is as much as i could do in terms of making it work with vite and nuxt 3, if you want to make any changes to it feel free to submit an issue.

**Depenencies Needed:**
- http-proxy-middleware
- @nuxt/kit
- fs-extra
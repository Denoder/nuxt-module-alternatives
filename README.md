# nuxt-module-alternatives
Alternative modules to use while waiting for Nuxt 3 Compatibility

**Current Modules**
- Nuxt Axios Module: [Nuxt Community Repository](https://github.com/nuxt-community/axios-module)
- Nuxt Http Module: [Nuxt Community Module](https://github.com/nuxt/http)
- Nuxt Proxy Module: [Nuxt Community Repository](https://github.com/nuxt-community/proxy-module)
- Nuxt Auth Module: [Nuxt Community Repository](https://github.com/nuxt-community/auth-module)
- Nuxt Vuetify Module: [Nuxt Community Repository](https://github.com/nuxt-community/vuetify-module)

**Module Order**

If you're using a combination of http/ohmyfetch, pinia and auth you need to load them in `modules` in the following order.
```
modules: [
    '@nuxtjs-alt/auth',
    '@nuxtjs-alt/http',
    '@nuxtjs-alt/proxy', // needed if using ssr
    '@pinia/nuxt',
]
```

**Instructions**

- Add any of the modules available via npm (package list: https://www.npmjs.com/org/nuxtjs-alt)

**Other Modules**

_If you have a nuxt module that looks like it wont be updated, and has any usefeulness to the general nuxt community, please tell me and I'll take a look into it._

Example `package.json`:
<details>
<summary>package.json</summary>

`yarn install`

```json
{
    "private": true,
    "scripts": {
        "dev": "nuxi dev",
        "build": "nuxi build",
        "start": "node .output/server/index.mjs"
    },
    "devDependencies": {
        "nuxt": "npm:nuxt3@latest"
    },
    "dependencies": {
        "@nuxtjs-alt/axios": "latest",
        "@nuxtjs-alt/auth": "latest",
        "@nuxtjs-alt/http": "latest",
        "@nuxtjs-alt/proxy": "latest",
        "@nuxtjs-alt/vuetify": "latest"
    }
}
```
</details>

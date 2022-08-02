# nuxt-module-alternatives
Alternative modules to use while waiting for Nuxt 3 Compatibility

**Current Modules**
- Nuxt Axios Module: [Nuxt Community Repository](https://github.com/nuxt-community/axios-module)
- Nuxt Http Module: [Nuxt Community Module](https://github.com/nuxt/http)
- Nuxt Proxy Module: [Nuxt Community Repository](https://github.com/nuxt-community/proxy-module)
- Nuxt Auth Module: [Nuxt Community Repository](https://github.com/nuxt-community/auth-module)
- Nuxt Google Fonts Module: [Nuxt Community Repository](https://github.com/nuxt-community/google-fonts-module)
- Nuxt SVG Sprite Module: [Nuxt Community Repository](https://github.com/nuxt-community/svg-sprite-module)
- Nuxt Vuetify Module: [Nuxt Community Repository](https://github.com/nuxt-community/vuetify-module)

**Other Information (Pinia)**

The pinia module has been removed. The module itself was as a means for me to maintain consistensy in naming conventions for the modules, but with all the rapid changes happening with nuxt till, It would be a good point to just use the official one. So start using `@pinia/nuxt` instead.
documentation has been changed accordingly.

**Module Order**

If you're using a combination of axios, pinia and auth you need to load them in `modules` in the following order.
```
modules: [
    '@nuxtjs-alt/auth',
    '@nuxtjs-alt/axios',
    '@pinia/nuxt',
]
```

**Instructions**

- Add any of these modules to your `modules` directory of your nuxt 3 application. 
- Then in your `package.json` add them as a local module.
- Finally run `npm install` to have them symlinked.
- You can then add them to the `modules` like you would in Nuxt with the same named aliases.

Adding them to workspaces will install the dependencies. Alternatively you can use the npmjs releases.

**Other Modules**

_If you have a nuxt module that looks like it wont be updated, and has any usefeulness to the general nuxt community, please tell me and I'll take a look into it._

Example `package.json`:
<details>
<summary>package.json</summary>

```json
{
    "private": true,
    "scripts": {
        "dev": "nuxi dev",
        "build": "nuxi build",
        "start": "node .output/server/index.mjs"
    },
    "devDependencies": {
        "nuxt": "latest"
    },
    "dependencies": {
        "@nuxtjs-alt/axios": "file:modules/@nuxtjs-alt/axios",
        "@nuxtjs-alt/auth": "file:modules/@nuxtjs-alt/auth",
        "@nuxtjs-alt/auth": "file:modules/@nuxtjs-alt/http",
        "@nuxtjs-alt/google-fonts": "file:modules/@nuxtjs-alt/google-fonts",
        "@nuxtjs-alt/proxy": "file:modules/@nuxtjs-alt/proxy",
        "@nuxtjs-alt/svg-sprite": "file:modules/@nuxtjs-alt/svg-sprite",
        "@nuxtjs-alt/vuetify": "file:modules/@nuxtjs-alt/vuetify"
    }
}
```
or (yarn add/install)

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
        "@nuxtjs-alt/google-fonts": "latest",
        "@nuxtjs-alt/proxy": "latest",
        "@nuxtjs-alt/svg-sprite": "latest",
        "@nuxtjs-alt/vuetify": "latest"
    }
}
```
</details>

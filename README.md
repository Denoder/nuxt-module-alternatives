# nuxt-module-alternatives
Alternative modules to use while waiting for Nuxt 3 Compatibility

**Current Modules**
- Nuxt Axios Module: [Nuxt Community Repository](https://github.com/nuxt-community/axios-module)
- Nuxt Proxy Module: [Nuxt Community Repository](https://github.com/nuxt-community/proxy-module)
- Nuxt Auth Module: [Nuxt Community Repository](https://github.com/nuxt-community/auth-module)
- Nuxt Google Fonts Module: [Nuxt Community Repository](https://github.com/nuxt-community/google-fonts-module)
- VueJS/Nuxt Pinia: [VueJS/Nuxt Pinia Repository](https://github.com/vuejs/pinia)
- Nuxt Element Plus: ?
- Nuxt Vuex: ?

**Other Information**

The `@nuxtjs` folder is deprecated, use `@nuxtjs-alt` instead (this is due to me adding it to npmjs)

**Instructions**

- Add any of these modules to your `modules` directory of your nuxt 3 application. 
- Then in your `package.json` add them as a local module.
- Finally run `npm install` to have them symlinked.
- You can then add them to the `modules` or `buildModules` like you would in Nuxt with the same named aliases.

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
        "nuxt3": "latest"
    },
    "dependencies": {
        "@nuxtjs-alt/axios": "file:modules/@nuxtjs-alt/axios",
        "@nuxtjs-alt/auth": "file:modules/@nuxtjs-alt/auth",
        "@nuxtjs-alt/element-plus": "file:modules/@nuxtjs-alt/element-plus",
        "@nuxtjs-alt/google-fonts": "file:modules/@nuxtjs-alt/google-fonts",
        "@nuxtjs-alt/pinia": "file:modules/@nuxtjs-alt/pinia",
        "@nuxtjs-alt/proxy": "file:modules/@nuxtjs-alt/proxy",
        "@nuxtjs-alt/vuex": "file:modules/@nuxtjs-alt/vuex" // Deprecated
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
        "nuxt3": "latest"
    },
    "dependencies": {
        "@nuxtjs-alt/axios": "latest",
        "@nuxtjs-alt/auth": "latest",
        "@nuxtjs-alt/element-plus": "latest",
        "@nuxtjs-alt/google-fonts": "latest",
        "@nuxtjs-alt/pinia": "latest",
        "@nuxtjs-alt/proxy": "latest",
        "@nuxtjs-alt/vuex": "latest" // Deprecated
    }
}
```
</details>

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

**Instructions**

- Add any of these modules to your `modules` directory of your nuxt 3 application. 
- Then in your `package.json` add them as a local module.
- Finally run `npm install` to have them symlinked.
- You can then add them to the `modules` or `buildModules` like you would in Nuxt with the same named aliases.

Alternatively you can use gitpkg to install these modules.

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
        "@nuxtjs/axios": "file:modules/@nuxtjs/axios",
        "@nuxtjs/auth": "file:modules/@nuxtjs/auth",
        "@nuxtjs/element-plus": "file:modules/@nuxtjs/element-plus",
        "@nuxtjs/google-fonts": "file:modules/@nuxtjs/google-fonts",
        "@nuxtjs/pinia": "file:modules/@nuxtjs/pinia",
        "@nuxtjs/proxy": "file:modules/@nuxtjs/proxy",
        "@nuxtjs/vuex": "file:modules/@nuxtjs/vuex" // Depricated
    }
}
```
or 

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
        "@nuxtjs/axios": "https://gitpkg.now.sh/Teranode/nuxt-module-alternatives/@nuxtjs/axios?master",
        "@nuxtjs/auth": "https://gitpkg.now.sh/Teranode/nuxt-module-alternatives/@nuxtjs/auth?master",
        "@nuxtjs/element-plus": "https://gitpkg.now.sh/Teranode/nuxt-module-alternatives/@nuxtjs/element-plus?master",
        "@nuxtjs/google-fonts": "https://gitpkg.now.sh/Teranode/nuxt-module-alternatives/@nuxtjs/google-fonts?master",
        "@nuxtjs/pinia": "https://gitpkg.now.sh/Teranode/nuxt-module-alternatives/@nuxtjs/pinia?master",
        "@nuxtjs/proxy": "https://gitpkg.now.sh/Teranode/nuxt-module-alternatives/@nuxtjs/proxy?master",
        "@nuxtjs/vuex": "https://gitpkg.now.sh/Teranode/nuxt-module-alternatives/@nuxtjs/vuex?master" // Depricated
    }
}
```
</details>

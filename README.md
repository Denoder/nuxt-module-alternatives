# nuxt-module-alternatives
Alternative modules to use while waiting for Nuxt 3 Compatibility

**Current Modules**
- Nuxt Axios Module: [Nuxt Community Repository](https://github.com/nuxt-community/axios-module)
- Nuxt Proxy Module: [Nuxt Community Repository](https://github.com/nuxt-community/proxy-module)
- Nuxt Google Fonts Module: [Nuxt Community Repository](https://github.com/nuxt-community/google-fonts-module)

**Instructions**
- Add any of these modules to your `modules` directory of your nuxt 3 application. 
- Then in your `package.json` add them as a local module.
- Finally run `npm install` to have them symlinked.
- You can then add them to the `modules` or `buildModules` like you would in Nuxt with the same named aliases.

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
        "axios": "^0.25.0",
        "axios-retry": "^3.2.4",
        "google-fonts-helper": "^2.0.1",
        "http-proxy-middleware": "^2.0.2",
        "nuxt3": "latest"
    },
    "dependencies": {
        "@nuxtjs/axios": "file:modules/@nuxtjs/axios",
        "@nuxtjs/google-fonts": "file:modules/@nuxtjs/google-fonts",
        "@nuxtjs/proxy": "file:modules/@nuxtjs/proxy",
        "@pinia/nuxt": "^0.1.8"
    }
}
```
</details>

Each module has a readme file with a list of packages that will need to be installed as a dependency.

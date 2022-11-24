This module is meant to try to work with Vuetify 3. Here is the config for you to work with

```ts
vuetify: {
    vuetifyOptions: {

    },
    pluginOptions: {
        autoImports: true // default
        styles: true // default
    },
}
```

**vuetifyOptions**

This is for the configuration of vuetify located here: 
https://next.vuetifyjs.com/en/features/global-configuration/

Material Design Icons is used by default via cdn urls. you can use `mdi`, `md` or `fa` for cdn urls when setting `defaultSet` in vuetify options.

**pluginOptions**

Please refer to the Readme located here: 
https://www.npmjs.com/package/vite-plugin-vuetify 

By default the styles will be set to true and will load `vuetify/styles`.

**Bugs**

Please note that there is a bug with vuetify. 
Info here: https://github.com/nuxt/framework/issues/8825 
Im more inclined to believe the issue is stemming from `vite-plugin-vuetify` & `@vuetify/loader-shared`.
## This package is deprecated please use the package at: https://github.com/nuxt-alt/vuetify

This module is meant to try to work with Vuetify 3. Here is the config for you to work with

```ts
vuetify: {
    vuetifyOptions: {

    },
    pluginOptions: {
        autoImports: true, // default
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

Please note that there is a bug with vuetify where custome scss files might not function correctly

Source: https://github.com/nuxt/framework/issues/8825

There's currently a bug with vueuse/head where it's potentially causing a memory leak and also not adapting changes when using the `useTheme` composable. For now I have made a workaround where the module will be running it's own `creatVuetify` instance inheriting from vueitfy and making the necissary changes to make it function. Until this is fixed thta will be used instead.

Source: https://github.com/vuetifyjs/vuetify/issues/16156

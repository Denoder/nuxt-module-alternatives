This module is meant to try to work with Vuetify 3. It is currently in alpha so things wont fully work. Here is the config for you to work with

```ts
vuetify: {
    config: {},
    plugins: [],
    customVariables: []
}
```

**config**

This is for the configuration of vuetify located here: 
https://next.vuetifyjs.com/en/features/global-configuration/

**plugins**

only use this if you plan on utitlizing more than one framework with vuetify. Under the hood this uses `unplugin-vue-components` and there can only be one instance of the component resolver so this will act as an extension to it.
(Similar to using vite.plugins but only takes place inside the vue-compoennt loader)

**customVariables**

Should work similarly to how the `vuetify-module` worked


**Other Information**

If you would like to work with different icons please read thhe instructions located here: https://next.vuetifyjs.com/en/features/icon-fonts/ I'm not sure what the other module used their own icon loader for but you can accomplish the same thing here. When adding icons you're going to be using the `config` property of vuetify. no icons areloaded by default because of version changes so follow the guide and add it in.

If you need any additions or changes, please tell me I'm not sure what additions this needs. (but please do rememebr that nuxt is in beta & vuetify is in alpha)
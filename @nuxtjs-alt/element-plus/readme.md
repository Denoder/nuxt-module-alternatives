**Information**

Use this if you use Element Plus for nuxt3

**Config**

```ts
import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    buildModules: [
        '@nuxtjs/element-plus',
    ],
    element: {
        mode: 'vite', // 'vite' or 'webpack'
        components: false,
        autoimport: false
    }
})
```

**Components/AutoImport Options**
```ts
{
    /**
     * import style css or sass with components
     *
     * @default 'css'
     */
    importStyle?: boolean | "css" | "sass";

    /**
     * use commonjs lib & source css or scss for ssr
     */
    ssr?: boolean;

    /**
     * specify element-plus version to load style
     *
     * @default installed version
     */
    version?: string;

    /**
     * auto import for directives
     *
     * @default true
     */
    directives?: boolean;

    /**
     * exclude component name, if match do not resolve the name
     */
    exclude?: RegExp;
}
```

**Depenencies Needed:**
- unplugin-auto-import
- unplugin-vue-components
- element-plus
- @nuxt/kit

import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    externals: [
        "#app",
        "vuetify",
        // Defaults
        '@nuxt/schema',
        '@nuxt/schema-edge',
        '@nuxt/kit',
        '@nuxt/kit-edge',
        'nuxt',
        'nuxt-edge',
        'nuxt3',
        'vue'
    ],
});
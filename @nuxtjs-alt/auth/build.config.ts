import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    externals: [
        "#app",
        "axios",
        "follow-redirects",
        // Workspace Modules
        "@nuxtjs-alt/axios",
        "@nuxtjs-alt/pinia",
        // Defaults
        "@nuxt/schema",
        "@nuxt/schema-edge",
        "@nuxt/kit",
        "@nuxt/kit-edge",
        "nuxt",
        "nuxt-edge",
        "nuxt3",
        "vue",
    ]
});

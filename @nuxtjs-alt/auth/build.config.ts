import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    declaration: true,
    externals: [
        "#app",
        "axios",
        "follow-redirects",
        // Workspace Modules
        "@nuxtjs-alt/axios",
        "@nuxtjs-alt/pinia",
        // Defaults
        "@nuxt/schema",
        "@nuxt/kit",
        "nuxt3",
    ]
});
import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    externals: [
        "#app",
        "axios",
        // Defaults
        "@nuxt/schema",
        "@nuxt/kit",
        "nuxt",
        "vue",
    ],
});
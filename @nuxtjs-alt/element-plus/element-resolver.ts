import type {
    ComponentInfo,
    ComponentResolver,
    SideEffectsInfo,
} from "./types";

import { getPkgVersion, kebabCase } from "./utils";

export interface ElementPlusResolverOptions {
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

type ElementPlusResolverOptionsResolved = Required<
    Omit<ElementPlusResolverOptions, "exclude">
> &
    Pick<ElementPlusResolverOptions, "exclude">;

function getSideEffects(
    dirName: string,
    options: ElementPlusResolverOptionsResolved
): SideEffectsInfo | undefined {
    const { importStyle, ssr } = options;
    const themeFolder = "element-plus/theme-chalk";
    const esComponentsFolder = "element-plus/es/components";

    if (importStyle === "sass")
        return ssr
            ? `${themeFolder}/src/${dirName}.scss`
            : `${esComponentsFolder}/${dirName}/style/index`;
    else if (importStyle === true || importStyle === "css")
        return ssr
            ? `${themeFolder}/el-${dirName}.css`
            : `${esComponentsFolder}/${dirName}/style/css`;
}

function resolveComponent(
    name: string,
    options: ElementPlusResolverOptionsResolved
): ComponentInfo | undefined {
    if (options.exclude && name.match(options.exclude)) return;

    if (!name.match(/^El[A-Z]/)) return;

    const partialName = kebabCase(name.slice(2)); // ElTableColumn -> table-column
    const { ssr } = options;

    return {
        importName: name,
        path: `element-plus/${ssr ? "lib" : "lib"}`, // ES module doesn't work so we use lib, til fixed
        sideEffects: getSideEffects(partialName, options),
    };
}

function resolveDirective(
    name: string,
    options: ElementPlusResolverOptionsResolved
): ComponentInfo | undefined {
    if (!options.directives) return;

    const directives: Record<string, { importName: string; styleName: string }> =
    {
        Loading: { importName: "ElLoadingDirective", styleName: "loading" },
        Popover: { importName: "ElPopoverDirective", styleName: "popover" },
        InfiniteScroll: {
            importName: "ElInfiniteScroll",
            styleName: "infinite-scroll",
        },
    };

    const directive = directives[name];
    if (!directive) return;

    const { ssr } = options;

    return {
        importName: directive.importName,
        path: `element-plus/${ssr ? "lib" : "lib"}`, // ES module doesn't work so we use lib, til fixed
        sideEffects: getSideEffects(directive.styleName, options),
    };
}

/**
 * Resolver for Element Plus
 *
 * See https://github.com/antfu/vite-plugin-components/pull/28 for more details
 * See https://github.com/antfu/vite-plugin-components/issues/117 for more details
 *
 * @author @develar @nabaonan @sxzz
 * @link https://element-plus.org/ for element-plus
 *
 */
export function ElementPlusResolver(
    options: ElementPlusResolverOptions = {}
): ComponentResolver[] {
    let optionsResolved: ElementPlusResolverOptionsResolved;

    async function resolveOptions() {
        if (optionsResolved) return optionsResolved;
        optionsResolved = {
            ssr: false,
            version: await getPkgVersion("element-plus", "2.2.0"),
            importStyle: "css",
            directives: true,
            exclude: undefined,
            ...options,
        };
        return optionsResolved;
    }

    return [
        {
            type: "component",
            resolve: async (name: string) => {
                return resolveComponent(name, await resolveOptions());
            },
        },
        {
            type: "directive",
            resolve: async (name: string) => {
                return resolveDirective(name, await resolveOptions());
            },
        },
    ];
}

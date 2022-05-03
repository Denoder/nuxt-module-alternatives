export interface VuetifyResolverOptions {
    /**
     * exclude component name, if match do not resolve the name
     */
    exclude?: RegExp;
}

type VuetifyResolverOptionsResolved = Required<Omit<VuetifyResolverOptions, "exclude">> & Pick<VuetifyResolverOptions, "exclude">;

function resolveComponent(
    name: string,
    options: VuetifyResolverOptionsResolved
): any {
    if (options.exclude && name.match(options.exclude)) return;
    
    if (!name.match(/^V[A-Z]/)) return;

    return {
        name,
        from: `vuetify/components`,
    };
}

/**
 * Resolver for Vuetify
 */
export function VuetifyResolver(
    options: VuetifyResolverOptions = {}
): any[] {
    let optionsResolved: VuetifyResolverOptionsResolved;

    async function resolveOptions() {
        if (optionsResolved) return optionsResolved;
        optionsResolved = {
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
    ];
}

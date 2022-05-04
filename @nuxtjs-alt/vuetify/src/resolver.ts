function resolveComponent(
    name: string
): any {
    if (!name.match(/^V[A-Z]/)) return;

    return {
        name,
        from: `vuetify/components`,
    };
}

/**
 * Resolver for Vuetify
 */
export function VuetifyResolver(): any[] {
    return [
        {
            type: "component",
            resolve: async (name: string) => {
                return resolveComponent(name);
            },
        },
    ];
}

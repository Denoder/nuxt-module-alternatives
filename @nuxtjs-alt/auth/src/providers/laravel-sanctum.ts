import type { ProviderPartialOptions, HTTPRequest, ProviderOptions } from "../types";
import type { CookieSchemeOptions } from "../runtime";
import { assignDefaults } from "../utils/provider";

export interface LaravelSanctumProviderOptions extends ProviderOptions, CookieSchemeOptions {}

export function laravelSanctum(nuxt: any, strategy: ProviderPartialOptions<LaravelSanctumProviderOptions>): void {
    const endpointDefaults: Partial<HTTPRequest> = {
        credentials: 'include',
    };

    const DEFAULTS: typeof strategy = {
        scheme: "cookie",
        name: "laravelSanctum",
        cookie: {
            name: "XSRF-TOKEN",
            server: true,
        },
        endpoints: {
            csrf: {
                ...endpointDefaults,
                url: '/sanctum/csrf-cookie',
            },
            login: {
                ...endpointDefaults,
                url: '/login',
            },
            logout: {
                ...endpointDefaults,
                url: '/logout',
            },
            user: {
                ...endpointDefaults,
                url: '/api/user',
            },
        },
        user: {
            property: {
                client: false,
                server: false,
            },
            autoFetch: true,
        },
    };

    assignDefaults(strategy, DEFAULTS)
}

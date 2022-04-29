import type {
    ProviderPartialOptions,
    HTTPRequest,
    ProviderOptions,
} from "../types";
import type { CookieSchemeOptions } from "../runtime";

import { assignDefaults } from "../utils/provider";

export interface LaravelSanctumProviderOptions
    extends ProviderOptions,
        CookieSchemeOptions {
    url: string;
}

export function laravelSanctum(
    nuxt: any,
    strategy: ProviderPartialOptions<LaravelSanctumProviderOptions>
): void {
    const endpointDefaults: Partial<HTTPRequest> = {
        withCredentials: true,
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
            Accept: "application/json",
        },
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
                url: `${strategy.url ? strategy.url : ""}/sanctum/csrf-cookie`,
            },
            login: {
                ...endpointDefaults,
                url: `${strategy.url ? strategy.url : ""}/login`,
            },
            logout: {
                ...endpointDefaults,
                url: `${strategy.url ? strategy.url : ""}/logout`,
            },
            user: {
                ...endpointDefaults,
                url: `${strategy.url ? strategy.url : ""}/api/user`,
            },
        },
        user: {
            property: {
                client: false,
                server: false,
            },
            autoFetch: true,
        },
        ...strategy,
    };

    assignDefaults(strategy, DEFAULTS);
}

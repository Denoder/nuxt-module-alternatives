import type { ProviderOptions, ProviderPartialOptions } from "../types";
import type { Oauth2SchemeOptions } from "../runtime";
import { assignDefaults, addAuthorize } from "../utils/provider";

export interface GithubProviderOptions extends ProviderOptions, Oauth2SchemeOptions {}

export function github(
    nuxt: any,
    strategy: ProviderPartialOptions<GithubProviderOptions>
): void {
    const DEFAULTS: typeof strategy = {
        scheme: "oauth2",
        endpoints: {
            authorization: "https://github.com/login/oauth/authorize",
            token: "https://github.com/login/oauth/access_token",
            userInfo: "https://api.github.com/user",
        },
        scope: ["user", "email"],
    };

    assignDefaults(strategy, DEFAULTS);

    addAuthorize(nuxt, strategy);
}

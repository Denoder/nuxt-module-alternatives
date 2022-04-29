import type { ProviderPartialOptions, ProviderOptions } from "../types";
import type { Oauth2SchemeOptions } from "../runtime";
import { assignDefaults } from "../utils/provider";

export interface FacebookProviderOptions extends ProviderOptions, Oauth2SchemeOptions {}

export function facebook(
    nuxt: any,
    strategy: ProviderPartialOptions<FacebookProviderOptions>
): void {
    const DEFAULTS: typeof strategy = {
        scheme: "oauth2",
        endpoints: {
            authorization: "https://facebook.com/v2.12/dialog/oauth",
            userInfo: "https://graph.facebook.com/v2.12/me?fields=about,name,picture{url},email",
        },
        scope: ["public_profile", "email"],
    };

    assignDefaults(strategy, DEFAULTS);
}

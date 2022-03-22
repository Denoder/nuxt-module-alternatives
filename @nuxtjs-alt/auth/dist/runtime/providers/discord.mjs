import { assignDefaults, addAuthorize } from "../utils/provider.mjs";
export function discord(strategy) {
  const DEFAULTS = {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://discord.com/api/oauth2/authorize",
      token: "https://discord.com/api/oauth2/token",
      userInfo: "https://discord.com/api/users/@me"
    },
    grantType: "authorization_code",
    codeChallengeMethod: "S256",
    scope: ["identify", "email"]
  };
  assignDefaults(strategy, DEFAULTS);
  addAuthorize(strategy, true);
}

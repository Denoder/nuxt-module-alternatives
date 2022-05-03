import { assignDefaults, addAuthorize } from "../utils/provider";
export function github(nuxt, strategy) {
  const DEFAULTS = {
    scheme: "oauth2",
    endpoints: {
      authorization: "https://github.com/login/oauth/authorize",
      token: "https://github.com/login/oauth/access_token",
      userInfo: "https://api.github.com/user"
    },
    scope: ["user", "email"]
  };
  assignDefaults(strategy, DEFAULTS);
  addAuthorize(nuxt, strategy);
}

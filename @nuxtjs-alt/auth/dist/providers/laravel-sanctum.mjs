import { assignDefaults } from "../utils/provider";
export function laravelSanctum(nuxt, strategy) {
  const endpointDefaults = {
    withCredentials: true,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  };
  const DEFAULTS = {
    scheme: "cookie",
    name: "laravelSanctum",
    cookie: {
      name: "XSRF-TOKEN",
      server: true
    },
    endpoints: {
      csrf: {
        ...endpointDefaults,
        url: `${strategy.url ? strategy.url : ""}/sanctum/csrf-cookie`
      },
      login: {
        ...endpointDefaults,
        url: `${strategy.url ? strategy.url : ""}/login`
      },
      logout: {
        ...endpointDefaults,
        url: `${strategy.url ? strategy.url : ""}/logout`
      },
      user: {
        ...endpointDefaults,
        url: `${strategy.url ? strategy.url : ""}/api/user`
      }
    },
    user: {
      property: {
        client: false,
        server: false
      },
      autoFetch: true
    },
    ...strategy
  };
  assignDefaults(strategy, DEFAULTS);
}

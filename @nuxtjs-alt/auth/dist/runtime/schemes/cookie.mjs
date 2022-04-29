import { BaseScheme } from "./base.mjs";
import { getProp } from "../../utils";
import { RequestHandler } from "../inc/index.mjs";
const DEFAULTS = {
  name: "cookie",
  cookie: {
    name: null,
    server: false
  },
  endpoints: {
    csrf: false,
    login: {
      url: "/api/auth/login",
      method: "post"
    },
    logout: {
      url: "/api/auth/logout",
      method: "post"
    },
    user: {
      url: "/api/auth/user",
      method: "get"
    }
  },
  user: {
    property: {
      client: false,
      server: false
    },
    autoFetch: true
  }
};
export class CookieScheme extends BaseScheme {
  constructor($auth, options, ...defaults) {
    super($auth, options, ...defaults, DEFAULTS);
    this.requestHandler = new RequestHandler(this, this.$auth.ctx.$axios);
  }
  mounted() {
    if (process.server) {
      this.$auth.ctx.$axios.setHeader("referer", this.$auth.ctx.ssrContext.req.headers.host);
    }
    this.initializeRequestInterceptor();
    if (this.isCookieServer() || this.isCookieClient()) {
      return this.$auth.fetchUserOnce();
    }
  }
  check() {
    const response = { valid: false };
    if (this.options.cookie.name) {
      const cookies = this.$auth.$storage.getCookies();
      if (this.isCookieServer() || this.isCookieClient()) {
        response.valid = Boolean(cookies[this.options.cookie.name]);
      } else {
        response.valid = true;
      }
      return response;
    }
    response.valid = true;
    return response;
  }
  async login(endpoint) {
    this.$auth.reset();
    if (this.options.endpoints.csrf) {
      await this.$auth.request(this.options.endpoints.csrf, {
        maxRedirects: 0
      });
    }
    if (!this.options.endpoints.login) {
      return;
    }
    const response = await this.$auth.request(endpoint, this.options.endpoints.login);
    if (!this.requestHandler.interceptor) {
      this.initializeRequestInterceptor();
    }
    if (this.options.user.autoFetch) {
      await this.fetchUser();
    }
    return response;
  }
  fetchUser(endpoint) {
    if (this.isCookieServer() || this.isCookieClient()) {
      if (!this.check().valid) {
        return Promise.resolve();
      }
    }
    if (!this.options.endpoints.user) {
      this.$auth.setUser({});
      return Promise.resolve();
    }
    return this.$auth.requestWith(endpoint, this.options.endpoints.user).then((response) => {
      let userData;
      if (process.client) {
        userData = getProp(response.data, this.options.user.property.client);
      } else {
        userData = getProp(response.data, this.options.user.property.server);
      }
      if (!userData) {
        const error = new Error(`User Data response does not contain field ${this.options.user.property}`);
        return Promise.reject(error);
      }
      this.$auth.setUser(userData);
      return response;
    }).catch((error) => {
      this.$auth.callOnError(error, { method: "fetchUser" });
      return Promise.reject(error);
    });
  }
  async logout(endpoint = {}) {
    if (this.options.endpoints.logout) {
      await this.$auth.requestWith(endpoint, this.options.endpoints.logout).catch((err) => {
        console.error(err);
      });
    }
    return this.$auth.reset();
  }
  reset({ resetInterceptor = true } = {}) {
    if (this.options.cookie.name) {
      this.$auth.$storage.setCookie(this.options.cookie.name, null, {
        prefix: ""
      });
    }
    this.$auth.setUser(false);
    if (resetInterceptor) {
      this.requestHandler.reset();
    }
  }
  isCookieServer() {
    return this.options.cookie.server && process.server;
  }
  isCookieClient() {
    return !this.options.cookie.server && process.client;
  }
  initializeRequestInterceptor() {
    this.requestHandler.initializeRequestInterceptor();
  }
}

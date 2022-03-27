import requrl from "requrl";
import { useRouter, useRoute } from "#app";
import {
  isRelativeURL,
  isSet,
  isSameURL,
  getProp,
  routeOption
} from "../utils";
import { Storage } from "./storage.mjs";
export class Auth {
  constructor(ctx, options) {
    this.strategies = {};
    this.#errorListeners = [];
    this.#redirectListeners = [];
    this.ctx = ctx;
    this.options = options;
    const initialState = { user: null, loggedIn: false };
    const storage = new Storage(ctx, { ...options, ...{ initialState } });
    this.$storage = storage;
    this.$state = storage.state;
  }
  #errorListeners;
  #redirectListeners;
  get strategy() {
    return this.getStrategy();
  }
  getStrategy(throwException = true) {
    if (throwException) {
      if (!this.$state.strategy) {
        throw new Error("No strategy is set!");
      }
      if (!this.strategies[this.$state.strategy]) {
        throw new Error("Strategy not supported: " + this.$state.strategy);
      }
    }
    return this.strategies[this.$state.strategy];
  }
  get user() {
    return this.$state.user;
  }
  get loggedIn() {
    return this.$state.loggedIn;
  }
  get busy() {
    return this.$storage.getState("busy");
  }
  init() {
    if (this.options.resetOnError) {
      this.onError((...args) => {
        if (typeof this.options.resetOnError !== "function" || this.options.resetOnError(...args)) {
          this.reset();
        }
      });
    }
    this.$storage.syncUniversal("strategy", this.options.defaultStrategy);
    if (!this.getStrategy(false)) {
      this.$storage.setUniversal("strategy", this.options.defaultStrategy);
    }
    try {
      this.mounted();
    } catch (error) {
      this.callOnError(error);
    } finally {
      if (process.client && this.options.watchLoggedIn) {
        this.$storage.watchState("loggedIn", (loggedIn) => {
          if (loggedIn) {
            const route = useRoute();
            if (!routeOption(route, "auth", false)) {
              this.redirect(loggedIn ? "home" : "logout");
            }
          }
        });
      }
    }
    return this;
  }
  registerStrategy(name, strategy) {
    this.strategies[name] = strategy;
  }
  setStrategy(name) {
    if (name === this.$storage.getUniversal("strategy")) {
      return Promise.resolve();
    }
    if (!this.strategies[name]) {
      throw new Error(`Strategy ${name} is not defined!`);
    }
    this.reset();
    this.$storage.setUniversal("strategy", name);
    return this.mounted();
  }
  mounted(...args) {
    if (!this.getStrategy().mounted) {
      return this.fetchUserOnce();
    }
    return Promise.resolve(this.getStrategy().mounted(...args)).catch((error) => {
      this.callOnError(error, { method: "mounted" });
      return Promise.reject(error);
    });
  }
  loginWith(name, ...args) {
    return this.setStrategy(name).then(() => this.login(...args));
  }
  login(...args) {
    if (!this.getStrategy().login) {
      return Promise.resolve();
    }
    return this.wrapLogin(this.getStrategy().login(...args)).catch((error) => {
      this.callOnError(error, { method: "login" });
      return Promise.reject(error);
    });
  }
  fetchUser(...args) {
    if (!this.getStrategy().fetchUser) {
      return Promise.resolve();
    }
    return Promise.resolve(this.getStrategy().fetchUser(...args)).catch((error) => {
      this.callOnError(error, { method: "fetchUser" });
      return Promise.reject(error);
    });
  }
  logout(...args) {
    if (!this.getStrategy().logout) {
      this.reset();
      return Promise.resolve();
    }
    return Promise.resolve(this.getStrategy().logout(...args)).catch((error) => {
      this.callOnError(error, { method: "logout" });
      return Promise.reject(error);
    });
  }
  setUserToken(token, refreshToken) {
    if (!this.getStrategy().setUserToken) {
      this.getStrategy().token.set(token);
      return Promise.resolve();
    }
    return Promise.resolve(this.getStrategy().setUserToken(token, refreshToken)).catch((error) => {
      this.callOnError(error, { method: "setUserToken" });
      return Promise.reject(error);
    });
  }
  reset(...args) {
    if (this.getStrategy().token && !this.getStrategy().reset) {
      this.setUser(false);
      this.getStrategy().token.reset();
      this.getStrategy().refreshToken.reset();
    }
    return this.getStrategy().reset(...args);
  }
  refreshTokens() {
    if (!this.getStrategy().refreshController) {
      return Promise.resolve();
    }
    return Promise.resolve(this.getStrategy().refreshController.handleRefresh()).catch((error) => {
      this.callOnError(error, { method: "refreshTokens" });
      return Promise.reject(error);
    });
  }
  check(...args) {
    if (!this.getStrategy().check) {
      return { valid: true };
    }
    return this.getStrategy().check(...args);
  }
  fetchUserOnce(...args) {
    if (!this.$state.user) {
      return this.fetchUser(...args);
    }
    return Promise.resolve();
  }
  setUser(user) {
    this.$storage.setState("user", user);
    let check = { valid: Boolean(user) };
    if (check.valid) {
      check = this.check();
    }
    this.$storage.setState("loggedIn", check.valid);
  }
  request(endpoint, defaults = {}) {
    const _endpoint = typeof defaults === "object" ? Object.assign({}, defaults, endpoint) : endpoint;
    if (_endpoint.baseURL === "") {
      _endpoint.baseURL = requrl(this.ctx.ssrContext.req);
    }
    if (!this.ctx.$axios) {
      console.error("[AUTH] add the @nuxtjs/axios module to nuxt.config file");
      return;
    }
    return this.ctx.$axios.request(_endpoint).catch((error) => {
      this.callOnError(error, { method: "request" });
      return Promise.reject(error);
    });
  }
  requestWith(endpoint, defaults) {
    const _endpoint = Object.assign({}, defaults, endpoint);
    if (this.getStrategy().token) {
      const token = this.getStrategy().token.get();
      const tokenName = this.getStrategy().options.token.name || "Authorization";
      if (!_endpoint.headers) {
        _endpoint.headers = {};
      }
      if (!_endpoint.headers[tokenName] && isSet(token) && token && typeof token === "string") {
        _endpoint.headers[tokenName] = token;
      }
    }
    return this.request(_endpoint);
  }
  wrapLogin(promise) {
    this.$storage.setState("busy", true);
    this.error = null;
    return Promise.resolve(promise).then((response) => {
      this.$storage.setState("busy", false);
      return response;
    }).catch((error) => {
      this.$storage.setState("busy", false);
      return Promise.reject(error);
    });
  }
  onError(listener) {
    this.#errorListeners.push(listener);
  }
  callOnError(error, payload = {}) {
    this.error = error;
    for (const fn of this.#errorListeners) {
      fn(error, payload);
    }
  }
  redirect(name, opt = {
    route: false,
    noRouter: false
  }) {
    const router = useRouter();
    const route = useRoute();
    if (!this.options.redirect) {
      return;
    }
    const from = opt.route ? this.options.fullPathRedirect ? opt.route.fullPath : opt.route.path : this.options.fullPathRedirect ? route.fullPath : route.path;
    let to = this.options.redirect[name];
    if (!to) {
      return;
    }
    if (this.options.rewriteRedirects) {
      if (name === "login" && isRelativeURL(from) && !isSameURL(this.ctx, to, from)) {
        this.$storage.setUniversal("redirect", from);
      }
      if (name === "home") {
        const redirect = this.$storage.getUniversal("redirect");
        this.$storage.setUniversal("redirect", null);
        if (isRelativeURL(redirect)) {
          to = redirect;
        }
      }
    }
    to = this.callOnRedirect(to, from) || to;
    if (isSameURL(this.ctx, to, from)) {
      return;
    }
    const queryString = Object.keys(opt.route ? opt.route.query : route.query).map((key) => key + "=" + opt.route ? opt.route.query[key] : route.query[key]).join("&");
    if (opt.noRouter) {
      window.location.replace(to + (queryString ? "?" + queryString : ""));
    } else {
      router.push(to + (queryString ? "?" + queryString : ""));
    }
  }
  onRedirect(listener) {
    this.#redirectListeners.push(listener);
  }
  callOnRedirect(to, from) {
    for (const fn of this.#redirectListeners) {
      to = fn(to, from) || to;
    }
    return to;
  }
  hasScope(scope) {
    const userScopes = this.$state.user && getProp(this.$state.user, this.options.scopeKey);
    if (!userScopes) {
      return false;
    }
    if (Array.isArray(userScopes)) {
      return userScopes.includes(scope);
    }
    return Boolean(getProp(userScopes, scope));
  }
}

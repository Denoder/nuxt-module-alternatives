import { defineStore } from "pinia";
import { parse, serialize } from "cookie-es";
import { isUnset, isSet, decodeValue, encodeValue } from "../utils/index.mjs";
export class Storage {
  #store;
  #initStore;
  #state;
  #piniaEnabled;
  constructor(ctx, options) {
    this.ctx = ctx;
    this.options = options;
    this.#initState();
  }
  setUniversal(key, value) {
    if (isUnset(value)) {
      return this.removeUniversal(key);
    }
    this.setCookie(key, value);
    this.setLocalStorage(key, value);
    this.setState(key, value);
    return value;
  }
  getUniversal(key) {
    let value;
    if (process.server) {
      value = this.getState(key);
    }
    if (isUnset(value)) {
      value = this.getCookie(key);
    }
    if (isUnset(value)) {
      value = this.getLocalStorage(key);
    }
    if (isUnset(value)) {
      value = this.getState(key);
    }
    return value;
  }
  syncUniversal(key, defaultValue) {
    let value = this.getUniversal(key);
    if (isUnset(value) && isSet(defaultValue)) {
      value = defaultValue;
    }
    if (isSet(value)) {
      this.setUniversal(key, value);
    }
    return value;
  }
  removeUniversal(key) {
    this.removeState(key);
    this.removeLocalStorage(key);
    this.removeCookie(key);
  }
  #initState() {
    this.#state = {};
    this.#piniaEnabled = this.options.pinia && !!this.ctx.pinia;
    if (this.#piniaEnabled) {
      this.#store = defineStore(this.options.pinia.namespace, {
        state: () => this.options.initialState,
        actions: {
          SET(payload) {
            this.$patch({ [payload.key]: payload.value });
          }
        }
      });
      this.#initStore = this.getStore(this.ctx.$pinia);
      this.state = this.#initStore.$state;
    } else {
      this.state = {};
      console.warn("[AUTH] The pinia store is not activated. This might cause issues in auth module behavior, like redirects not working properly.To activate it, please install it and add it to your config after this module");
    }
  }
  getStore(pinia) {
    if (pinia) {
      return this.#store(pinia);
    }
    return this.#store();
  }
  setState(key, value) {
    if (key[0] === "_") {
      this.#state[key] = value;
    } else if (this.#piniaEnabled) {
      const { SET } = this.#initStore;
      SET({ key, value });
    } else {
      this.state[key] = value;
    }
    return value;
  }
  getState(key) {
    if (key[0] !== "_") {
      return this.state[key];
    } else {
      return this.#state[key];
    }
  }
  watchState(watchKey, fn) {
    if (this.#piniaEnabled) {
      return this.#initStore.$onAction(({ name, args }) => {
        if (name === "SET") {
          const { key, value } = args[0];
          if (key === watchKey) {
            fn(value);
          }
        }
      });
    }
  }
  removeState(key) {
    this.setState(key, void 0);
  }
  setLocalStorage(key, value) {
    if (isUnset(value)) {
      return this.removeLocalStorage(key);
    }
    if (!this.isLocalStorageEnabled()) {
      return;
    }
    const _key = this.getPrefix() + key;
    try {
      localStorage.setItem(_key, encodeValue(value));
    } catch (e) {
      if (!this.options.ignoreExceptions) {
        throw e;
      }
    }
    return value;
  }
  getLocalStorage(key) {
    if (!this.isLocalStorageEnabled()) {
      return;
    }
    const _key = this.getPrefix() + key;
    const value = localStorage.getItem(_key);
    return decodeValue(value);
  }
  removeLocalStorage(key) {
    if (!this.isLocalStorageEnabled()) {
      return;
    }
    const _key = this.getPrefix() + key;
    localStorage.removeItem(_key);
  }
  getCookies() {
    if (!this.isCookiesEnabled()) {
      return;
    }
    const cookieStr = process.client ? document.cookie : this.ctx.ssrContext.req.headers.cookie;
    return parse(cookieStr || "") || {};
  }
  setCookie(key, value, options = {}) {
    if (!this.options.cookie || process.server && !this.ctx.ssrContext.res) {
      return;
    }
    if (!this.isCookiesEnabled()) {
      return;
    }
    const _prefix = options.prefix !== void 0 ? options.prefix : this.options.cookie.prefix;
    const _key = _prefix + key;
    const _options = Object.assign({}, this.options.cookie.options, options);
    const _value = encodeValue(value);
    if (isUnset(value)) {
      _options.maxAge = -1;
    }
    if (typeof _options.expires === "number") {
      _options.expires = new Date(Date.now() + _options.expires * 864e5);
    }
    const serializedCookie = serialize(_key, _value, _options);
    if (process.client) {
      document.cookie = serializedCookie;
    } else if (process.server && this.ctx.ssrContext.res) {
      let cookies = this.ctx.ssrContext.res.getHeader("Set-Cookie") || [];
      if (!Array.isArray(cookies))
        cookies = [cookies];
      cookies.unshift(serializedCookie);
      this.ctx.ssrContext.res.setHeader("Set-Cookie", cookies.filter((v, i, arr) => arr.findIndex((val) => val.startsWith(v.slice(0, v.indexOf("=")))) === i));
    }
    return value;
  }
  getCookie(key) {
    if (!this.options.cookie || process.server && !this.ctx.ssrContext.req) {
      return;
    }
    if (!this.isCookiesEnabled()) {
      return;
    }
    const _key = this.options.cookie.prefix + key;
    const cookies = this.getCookies();
    const value = cookies[_key] ? decodeURIComponent(cookies[_key]) : void 0;
    return decodeValue(value);
  }
  removeCookie(key, options) {
    this.setCookie(key, void 0, options);
  }
  getPrefix() {
    if (!this.options.localStorage) {
      throw new Error("Cannot get prefix; localStorage is off");
    }
    return this.options.localStorage.prefix;
  }
  isLocalStorageEnabled() {
    if (!this.options.localStorage) {
      return false;
    }
    if (process.server) {
      return false;
    }
    const test = "test";
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      if (!this.options.ignoreExceptions) {
        console.warn("[AUTH] Local storage is enabled in config, but the browser does not support it.");
      }
      return false;
    }
  }
  isCookiesEnabled() {
    if (!this.options.cookie) {
      return false;
    }
    if (process.server) {
      return true;
    }
    if (window.navigator.cookieEnabled) {
      return true;
    } else {
      console.warn("[AUTH] Cookies are enabled in config, but the browser does not support it.");
      return false;
    }
  }
}

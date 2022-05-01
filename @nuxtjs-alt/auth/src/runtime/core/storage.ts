import { NuxtApp } from "#app";
import { defineStore } from "pinia";
import { parse, serialize } from "cookie-es";
import { isUnset, isSet, decodeValue, encodeValue } from "../../utils";
import type { ModuleOptions } from "../../types";

export class Storage {
    ctx: NuxtApp;
    options: ModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #store: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #initStore: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    #state: any;
    #piniaEnabled: boolean;

    constructor(ctx: NuxtApp, options: ModuleOptions) {
        this.ctx = ctx;
        this.options = options;

        this.#initState();
    }

    // ------------------------------------
    // Universal
    // ------------------------------------

    setUniversal<V extends unknown>(key: string, value: V): V | void {
        // Unset null, undefined
        if (isUnset(value)) {
            return this.removeUniversal(key);
        }

        // Cookies
        this.setCookie(key, value);

        // Local Storage
        this.setLocalStorage(key, value);

        // Session Storage
        this.setSessionStorage(key, value);

        // Local state
        this.setState(key, value);

        return value;
    }

    getUniversal(key: string): unknown {
        let value;

        // Local state
        if (process.server) {
            value = this.getState(key);
        }

        // Cookies
        if (isUnset(value)) {
            value = this.getCookie(key);
        }

        // Local Storage
        if (isUnset(value)) {
            value = this.getLocalStorage(key);
        }

        // Session Storage
        if (isUnset(value)) {
            value = this.getSessionStorage(key);
        }

        // Local state
        if (isUnset(value)) {
            value = this.getState(key);
        }

        return value;
    }

    syncUniversal(key: string, defaultValue?: unknown): unknown {
        let value = this.getUniversal(key);

        if (isUnset(value) && isSet(defaultValue)) {
            value = defaultValue;
        }

        if (isSet(value)) {
            this.setUniversal(key, value);
        }

        return value;
    }

    removeUniversal(key: string): void {
        this.removeState(key);
        this.removeLocalStorage(key);
        this.removeSessionStorage(key);
        this.removeCookie(key);
    }

    // ------------------------------------
    // Local state (reactive)
    // ------------------------------------

    #initState(): void {
        // Private state is suitable to keep information not being exposed to pinia store
        // This helps prevent stealing token from SSR response HTML
        this.#state = {};

        // Use pinia for local state's if possible
        this.#piniaEnabled = this.options.pinia && !!this.ctx.pinia;

        if (this.#piniaEnabled) {
            this.#store = defineStore(this.options.pinia.namespace, {
                state: () => this.options.initialState,
                actions: {
                    SET(payload) {
                        this.$patch({ [payload.key]: payload.value });
                    },
                },
            });

            this.#initStore = this.#store(this.ctx.pinia);
            this.state = this.#initStore.$state;
        } else {
            this.state = {};

            // eslint-disable-next-line no-console
            console.warn(
                "[AUTH] The pinia store is not activated. This might cause issues in auth module behavior, like redirects not working properly." +
                    "To activate it, please install it and add it to your config after this module"
            );
        }
    }

    getStore(pinia: any): any {
        return pinia ? this.#store(pinia) : this.#initStore;
    }

    setState<V extends unknown>(key: string, value: V): V {
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

    getState(key: string): unknown {
        if (key[0] !== "_") {
            return this.state[key];
        } else {
            return this.#state[key];
        }
    }

    watchState(watchKey: string, fn: (value: unknown) => void): () => void {
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

    removeState(key: string): void {
        this.setState(key, undefined);
    }

    // ------------------------------------
    // Local storage
    // ------------------------------------

    setLocalStorage<V extends unknown>(key: string, value: V): V | void {
        // Unset null, undefined
        if (isUnset(value)) {
            return this.removeLocalStorage(key);
        }

        if (!this.isLocalStorageEnabled()) {
            return;
        }

        const _key = this.getLocalStoragePrefix() + key;

        try {
            localStorage.setItem(_key, encodeValue(value));
        } catch (e) {
            if (!this.options.ignoreExceptions) {
                throw e;
            }
        }

        return value;
    }

    getLocalStorage(key: string): unknown {
        if (!this.isLocalStorageEnabled()) {
            return;
        }

        const _key = this.getLocalStoragePrefix() + key;

        const value = localStorage.getItem(_key);

        return decodeValue(value);
    }

    removeLocalStorage(key: string): void {
        if (!this.isLocalStorageEnabled()) {
            return;
        }

        const _key = this.getLocalStoragePrefix() + key;

        localStorage.removeItem(_key);
    }

    getLocalStoragePrefix(): string {
        if (!this.options.localStorage) {
            throw new Error("Cannot get prefix; localStorage is off");
        }

        return this.options.localStorage.prefix;
    }

    isLocalStorageEnabled(): boolean {
        // Disabled by configuration
        if (!this.options.localStorage) {
            return false;
        }

        // Local Storage only exists in the browser
        if (process.server) {
            return false;
        }

        // There's no great way to check if localStorage is enabled; most solutions
        // error out. So have to use this hacky approach :\
        // https://stackoverflow.com/questions/16427636/check-if-localstorage-is-available
        const test = "test";

        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            if (!this.options.ignoreExceptions) {
                // eslint-disable-next-line no-console
                console.warn(
                    "[AUTH] Local storage is enabled in config, but the browser does not support it."
                );
            }
            return false;
        }
    }

    // ------------------------------------
    // Session storage
    // ------------------------------------

    setSessionStorage<V extends unknown>(key: string, value: V): V | void {
        // Unset null, undefined
        if (isUnset(value)) {
            return this.removeSessionStorage(key)
        }
    
        if (!this.isSessionStorageEnabled()) {
            return
        }
    
        const _key = this.getSessionStoragePrefix() + key
    
        try {
            sessionStorage.setItem(_key, encodeValue(value))
        } catch (e) {
            if (!this.options.ignoreExceptions) {
                throw e
            }
        }
    
        return value  
    }

    getSessionStorage(key: string): unknown {
        if (!this.isSessionStorageEnabled()) {
            return
        }

        const _key = this.getSessionStoragePrefix() + key

        const value = sessionStorage.getItem(_key)

        return decodeValue(value)
    }

    removeSessionStorage(key: string): void {
        if (!this.isSessionStorageEnabled()) {
            return
        }

        const _key = this.getSessionStoragePrefix() + key

        sessionStorage.removeItem(_key)
    }

    getSessionStoragePrefix(): string {
        if (!this.options.sessionStorage) {
            throw new Error("Cannot get prefix; sessionStorage is off");
        }

        return this.options.sessionStorage.prefix;
    }

    isSessionStorageEnabled(): boolean {
        // Disabled by configuration
        if (!this.options.sessionStorage) {
            return false
        }

        // Session Storage only exists in the browser
        if (process.server) {
            return false
        }

        // There is no proper way to check if the sessionStorage is available, same as with the localStorage.
        const test = 'test'
        try {
            sessionStorage.setItem(test, test)
            sessionStorage.removeItem(test)
            return true
        } catch (e) {
            if (!this.options.ignoreExceptions) {
                // eslint-disable-next-line no-console
                console.warn(
                    "[AUTH] Session storage is enabled in config, but the browser does not support it."
                )
            }
            return false
        }
    }

    // ------------------------------------
    // Cookies
    // ------------------------------------

    getCookies(): Record<string, unknown> {
        if (!this.isCookiesEnabled()) {
            return;
        }

        const cookieStr = process.client
            ? document.cookie
            // @ts-ignore
            : this.ctx.ssrContext.req.headers.cookie;

        return parse(cookieStr || "") || {};
    }

    setCookie<V extends unknown>(
        key: string,
        value: V,
        options: { prefix?: string } = {}
    ): V {

        if (
            !this.options.cookie ||
            // @ts-ignore
            (process.server && !this.ctx.ssrContext.res)
        ) {
            return;
        }

        if (!this.isCookiesEnabled()) {
            return;
        }

        const _prefix =
            options.prefix !== undefined
                ? options.prefix
                : this.options.cookie.prefix;
        const _key = _prefix + key;
        const _options = Object.assign(
            {},
            this.options.cookie.options,
            options
        );
        const _value = encodeValue(value);

        // Unset null, undefined
        if (isUnset(value)) {
            _options.maxAge = -1;
        }

        // Accept expires as a number for js-cookie compatiblity
        if (typeof _options.expires === "number") {
            _options.expires = new Date(Date.now() + _options.expires * 864e5);
        }

        /* @ts-ignore */
        const serializedCookie = serialize(_key, _value, _options);

        if (process.client) {
            // Set in browser
            document.cookie = serializedCookie;
            // @ts-ignore
        } else if (process.server && this.ctx.ssrContext.res) {
            // Send Set-Cookie header from server side
            let cookies =
                // @ts-ignore
                (this.ctx.ssrContext.res.getHeader("Set-Cookie") as string[]) ||
                [];
            if (!Array.isArray(cookies)) cookies = [cookies];
            cookies.unshift(serializedCookie);
            // @ts-ignore
            this.ctx.ssrContext.res.setHeader(
                "Set-Cookie",
                cookies.filter(
                    (v, i, arr) =>
                        arr.findIndex((val) =>
                            val.startsWith(v.slice(0, v.indexOf("=")))
                        ) === i
                )
            );
        }

        return value;
    }

    getCookie(key: string): unknown {
        if (
            !this.options.cookie ||
            // @ts-ignore
            (process.server && !this.ctx.ssrContext.req)
        ) {
            return;
        }

        if (!this.isCookiesEnabled()) {
            return;
        }

        const _key = this.options.cookie.prefix + key;

        const cookies = this.getCookies();

        const value = cookies[_key]
            ? decodeURIComponent(cookies[_key] as string)
            : undefined;

        return decodeValue(value);
    }

    removeCookie(key: string, options?: { prefix?: string }): void {
        this.setCookie(key, undefined, options);
    }

    isCookiesEnabled(): boolean {
        // Disabled by configuration
        if (!this.options.cookie) {
            return false;
        }

        // Server can only assume cookies are enabled, it's up to the client browser
        // to create them or not
        if (process.server) {
            return true;
        }

        if (window.navigator.cookieEnabled) {
            return true;
        } else {
            // eslint-disable-next-line no-console
            console.warn(
                "[AUTH] Cookies are enabled in config, but the browser does not support it."
            );
            return false;
        }
    }
}

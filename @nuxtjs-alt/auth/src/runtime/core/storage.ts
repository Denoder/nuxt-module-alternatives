import type { ModuleOptions } from '../../types';
import type { NuxtApp } from 'nuxt/app'
import { isUnset, isSet, decodeValue, encodeValue } from '../../utils';
import { parse, serialize, CookieSerializeOptions } from 'cookie-es';
import { defineStore, StateTree } from 'pinia';

export class Storage {
    ctx: NuxtApp;
    options: ModuleOptions;
    #store: any;
    #initStore: any;
    state: any;
    #state: any;
    #piniaEnabled: boolean;

    constructor(ctx: NuxtApp, options: ModuleOptions) {
        this.ctx = ctx;
        this.options = options;
        this.#piniaEnabled = false;

        this.#initState();
    }

    // ------------------------------------
    // Universal
    // ------------------------------------

    setUniversal<V extends any>(key: string, value: V): V | void {
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

    getUniversal(key: string): any {
        let value: any;

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

    syncUniversal(key: string, defaultValue?: any): any {
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
        this.removeCookie(key);
        this.removeLocalStorage(key);
        this.removeSessionStorage(key);
    }

    // ------------------------------------
    // Local state (reactive)
    // ------------------------------------

    #initState(): void {
        // Private state is suitable to keep information not being exposed to pinia store
        // This helps prevent stealing token from SSR response HTML
        this.#state = {};

        // Use pinia for local state's if possible
        this.#piniaEnabled = this.options.pinia && !!this.ctx.$pinia;

        if (this.#piniaEnabled) {
            this.#store = defineStore(this.options.pinia.namespace, {
                state: () => this.options.initialState as StateTree,
                actions: {
                    SET(payload: any) {
                        this.$patch({ [payload.key]: payload.value });
                    },
                },
            });

            this.#initStore = this.#store(this.ctx.$pinia);
            this.state = this.#initStore.$state;
        } else {
            this.state = {};

            console.warn('[AUTH] The pinia store is not activated. This might cause issues in auth module behavior, like redirects not working properly. To activate it, please install it and add it to your config after this module');
        }
    }

    get store() {
        return this.#initStore
    }

    getStore() {
        return this.#initStore;
    }

    setState<V extends any>(key: string, value: V): V {
        if (key[0] === '_') {
            this.#state[key] = value;
        }
        else if (this.#piniaEnabled) {
            const { SET } = this.#initStore;

            SET({ key, value });
        }
        else {
            this.state[key] = value;
        }

        return value;
    }

    getState(key: string): any {
        if (key[0] !== '_') {
            return this.state[key];
        } else {
            return this.#state[key];
        }
    }

    watchState(watchKey: string, fn: (value: any) => void) {
        if (this.#piniaEnabled) {
            return this.#initStore.$onAction((context: { name: string, args: any[] }) => {
                if (context.name === 'SET') {
                    const { key, value } = context.args[0];
                    if (watchKey === key) {
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

    setLocalStorage<V extends any>(key: string, value: V): V | void {
        // Unset null, undefined
        if (isUnset(value)) {
            return this.removeLocalStorage(key);
        }

        if (!this.isLocalStorageEnabled()) {
            return;
        }

        const $key = this.getLocalStoragePrefix() + key;

        try {
            localStorage.setItem($key, encodeValue(value));
        } catch (e) {
            if (!this.options.ignoreExceptions) {
                throw e;
            }
        }

        return value;
    }

    getLocalStorage(key: string): any {
        if (!this.isLocalStorageEnabled()) {
            return;
        }

        const $key = this.getLocalStoragePrefix() + key;

        const value = localStorage.getItem($key);

        return decodeValue(value);
    }

    removeLocalStorage(key: string): void {
        if (!this.isLocalStorageEnabled()) {
            return;
        }

        const $key = this.getLocalStoragePrefix() + key;

        localStorage.removeItem($key);
    }

    getLocalStoragePrefix(): string {
        if (!this.options.localStorage) {
            throw new Error('Cannot get prefix; localStorage is off');
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
        const test = 'test';

        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            if (!this.options.ignoreExceptions) {
                console.warn('[AUTH] Local storage is enabled in config, but the browser does not support it.');
            }
            return false;
        }
    }

    // ------------------------------------
    // Session storage
    // ------------------------------------

    setSessionStorage<V extends any>(key: string, value: V): V | void {
        // Unset null, undefined
        if (isUnset(value)) {
            return this.removeSessionStorage(key)
        }
    
        if (!this.isSessionStorageEnabled()) {
            return
        }
    
        const $key = this.getSessionStoragePrefix() + key
    
        try {
            sessionStorage.setItem($key, encodeValue(value))
        } catch (e) {
            if (!this.options.ignoreExceptions) {
                throw e
            }
        }
    
        return value  
    }

    getSessionStorage(key: string): any {
        if (!this.isSessionStorageEnabled()) {
            return
        }

        const $key = this.getSessionStoragePrefix() + key

        const value = sessionStorage.getItem($key)

        return decodeValue(value)
    }

    removeSessionStorage(key: string): void {
        if (!this.isSessionStorageEnabled()) {
            return
        }

        const $key = this.getSessionStoragePrefix() + key

        sessionStorage.removeItem($key)
    }

    getSessionStoragePrefix(): string {
        if (!this.options.sessionStorage) {
            throw new Error('Cannot get prefix; sessionStorage is off');
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
                console.warn('[AUTH] Session storage is enabled in config, but the browser does not support it.')
            }
            return false
        }
    }

    // ------------------------------------
    // Cookies
    // ------------------------------------

    getCookies(): Record<string, any> | void {
        if (!this.isCookiesEnabled()) {
            return;
        }

        const cookieStr = process.client ? document.cookie : this.ctx.ssrContext?.event.req.headers.cookie;

        return parse(cookieStr || '') || {};
    }

    setCookie<V extends any>(key: string, value: V, options: { prefix?: string } = {}) {
        if (!this.options.cookie || (process.server && !this.ctx.ssrContext?.event.res)) {
            return;
        }

        if (!this.isCookiesEnabled()) {
            return;
        }

        const prefix = options.prefix !== undefined ? options.prefix : this.options.cookie.prefix;
        const $key = prefix + key;
        const $options = Object.assign({}, this.options.cookie.options, options);
        const $value = encodeValue(value);

        // Unset null, undefined
        if (isUnset(value)) {
            $options.maxAge = -1;
        }

        // Accept expires as a number for js-cookie compatiblity
        if (typeof $options.expires === 'number') {
            $options.expires = new Date(Date.now() + $options.expires * 864e5);
        }

        const serializedCookie = serialize($key, $value, $options as CookieSerializeOptions);

        if (process.client) {
            // Set in browser
            document.cookie = serializedCookie;
        } 
        else if (process.server && this.ctx.ssrContext?.event.res) {
            // Send Set-Cookie header from server side
            let cookies = (this.ctx.ssrContext?.event.res.getHeader('Set-Cookie') as string[]) || [];
            if (!Array.isArray(cookies)) cookies = [cookies];
            cookies.unshift(serializedCookie);

            this.ctx.ssrContext?.event.res.setHeader('Set-Cookie', cookies.filter(
                (v, i, arr) => arr.findIndex( 
                    (val) => val.startsWith(v.slice(0, v.indexOf('='))) 
                ) === i
            ));
        }

        return value;
    }

    getCookie(key: string): any {
        if (!this.options.cookie || (process.server && !this.ctx.ssrContext?.event.req)) {
            return;
        }

        if (!this.isCookiesEnabled()) {
            return;
        }

        const $key = this.options.cookie.prefix + key;

        const cookies = this.getCookies();

        const value = cookies[$key] ? decodeURIComponent(cookies[$key] as string) : undefined;

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
            console.warn('[AUTH] Cookies are enabled in config, but the browser does not support it.');
            return false;
        }
    }
}

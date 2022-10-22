import type { HTTPRequest, HTTPResponse, Scheme, SchemeOptions, SchemeCheck, TokenableScheme, RefreshableScheme, ModuleOptions } from '../../types';
import type { NuxtApp } from '#app';
import { isRelativeURL, isSet, isSameURL, getProp, routeMeta } from '../../utils';
import { useRouter, useRoute } from '#imports';
import { Storage } from './storage';
import requrl from 'requrl';

export type ErrorListener = (...args: any[]) => void;
export type RedirectListener = (to: string, from: string) => string;

export class Auth {
    ctx: NuxtApp;
    options: ModuleOptions;
    strategies: Record<string, Scheme> = {};
    error: Error | undefined;
    $storage: Storage;
    $state: {
        strategy: string;
        user: Record<string, any>;
        loggedIn: boolean;
    };
    #errorListeners: ErrorListener[] = [];
    #redirectListeners: RedirectListener[] = [];

    constructor(ctx: NuxtApp, options: ModuleOptions) {
        this.ctx = ctx;
        this.options = options;

        // Storage & State
        const initialState = {
            user: null,
            loggedIn: false
        };

        const storage = new Storage(ctx, { 
            ...options,
            initialState
        });

        this.$storage = storage;
        this.$state = storage.state;
    }

    getStrategy(throwException = true): Scheme<SchemeOptions> {
        if (throwException) {
            if (!this.$state.strategy) {
                throw new Error('No strategy is set!');
            }
            if (!this.strategies[this.$state.strategy]) {
                throw new Error('Strategy not supported: ' + this.$state.strategy);
            }
        }

        return this.strategies[this.$state.strategy];
    }

    get strategy(): Scheme {
        return this.getStrategy();
    }


    get user(): Record<string, any> | null {
        return this.$state.user;
    }

    // ---------------------------------------------------------------
    // Strategy and Scheme
    // ---------------------------------------------------------------

    get loggedIn(): boolean {
        return this.$state.loggedIn;
    }

    get busy(): boolean {
        return this.$storage.getState('busy') as boolean;
    }

    async init(): Promise<void> {
        // Reset on error
        if (this.options.resetOnError) {
            this.onError((...args) => {
                if (typeof this.options.resetOnError !== 'function' || this.options.resetOnError(...args)) {
                    this.reset();
                }
            });
        }

        // Restore strategy
        this.$storage.syncUniversal('strategy', this.options.defaultStrategy);

        // Set default strategy if current one is invalid
        if (!this.getStrategy(false)) {
            this.$storage.setUniversal('strategy', this.options.defaultStrategy);

            // Give up if still invalid
            if (!this.getStrategy(false)) {
                return Promise.resolve();
            }
        }

        try {
            // Call mounted for active strategy on initial load
            await this.mounted();
        }
        catch (error: any) {
            this.callOnError(error);
        } 
        finally {
            if (process.client && this.options.watchLoggedIn) {
                this.$storage.watchState('loggedIn', (loggedIn: boolean) => {
                    const route = useRoute();
                    if (route.meta.auth && !routeMeta('auth', false)) {
                        this.redirect(loggedIn ? 'home' : 'logout');
                    }
                });
            }
        }        
    }

    registerStrategy(name: string, strategy: Scheme): void {
        this.strategies[name] = strategy;
    }

    async setStrategy(name: string): Promise<HTTPResponse | void> {
        if (name === this.$storage.getUniversal('strategy')) {
            return Promise.resolve();
        }

        if (!this.strategies[name]) {
            throw new Error(`Strategy ${name} is not defined!`);
        }

        // Reset current strategy
        this.reset();

        // Set new strategy
        this.$storage.setUniversal('strategy', name);

        // Call mounted hook on active strategy
        return this.mounted();
    }

    async mounted(...args: any[]): Promise<HTTPResponse | void> {
        if (!this.getStrategy().mounted) {
            return this.fetchUserOnce();
        }

        return Promise.resolve(this.getStrategy().mounted!(...args)).catch(
            (error) => {
                this.callOnError(error, { method: 'mounted' });
                return Promise.reject(error);
            }
        );
    }

    async loginWith(name: string, ...args: any[]): Promise<HTTPResponse | void> {
        return this.setStrategy(name).then(() => this.login(...args));
    }

    async login(...args: any[]): Promise<HTTPResponse | void> {
        if (!this.getStrategy().login) {
            return Promise.resolve();
        }

        return this.wrapLogin(this.getStrategy().login(...args)).catch(
            (error) => {
                this.callOnError(error, { method: 'login' });
                return Promise.reject(error);
            }
        );
    }

    async fetchUser(...args: any[]): Promise<HTTPResponse | void> {
        if (!this.getStrategy().fetchUser) {
            return Promise.resolve();
        }

        return Promise.resolve(this.getStrategy().fetchUser(...args)).catch(
            (error) => {
                this.callOnError(error, { method: 'fetchUser' });
                return Promise.reject(error);
            }
        );
    }

    async logout(...args: any[]): Promise<void> {
        if (!this.getStrategy().logout) {
            this.reset();
            return Promise.resolve();
        }

        return Promise.resolve(this.getStrategy().logout!(...args)).catch(
            (error) => {
                this.callOnError(error, { method: 'logout' });
                return Promise.reject(error);
            }
        );
    }

    // ---------------------------------------------------------------
    // User helpers
    // ---------------------------------------------------------------

    async setUserToken(token: string | boolean, refreshToken?: string | boolean): Promise<HTTPResponse | void> {
        if (!this.getStrategy().setUserToken) {
            (this.getStrategy() as TokenableScheme).token!.set(token);
            return Promise.resolve();
        }

        return Promise.resolve(this.getStrategy().setUserToken!(token, refreshToken)).catch((error) => {
            this.callOnError(error, { method: 'setUserToken' });
            return Promise.reject(error);
        });
    }

    reset(...args: any[]): void {
        if ((this.getStrategy() as TokenableScheme).token && !this.getStrategy().reset) {
            this.setUser(false);
            (this.getStrategy() as TokenableScheme).token!.reset();
            (this.getStrategy() as RefreshableScheme).refreshToken.reset();
        }

        return this.getStrategy().reset!(
            ...(args as [options?: { resetInterceptor: boolean }])
        );
    }

    async refreshTokens(): Promise<HTTPResponse | void> {
        if (!(this.getStrategy() as RefreshableScheme).refreshController) {
            return Promise.resolve();
        }

        return Promise.resolve((this.getStrategy() as RefreshableScheme).refreshController.handleRefresh()).catch((error) => {
            this.callOnError(error, { method: 'refreshTokens' });
            return Promise.reject(error);
        });
    }

    check(...args: any[]): SchemeCheck {
        if (!this.getStrategy().check) {
            return { valid: true };
        }

        return this.getStrategy().check!(...(args as [checkStatus: boolean]));
    }

    async fetchUserOnce(...args: any[]): Promise<HTTPResponse | void> {
        if (!this.$state.user) {
            return this.fetchUser(...args);
        }

        return Promise.resolve();
    }

    // ---------------------------------------------------------------
    // Utils
    // ---------------------------------------------------------------

    setUser(user: any): void {
        this.$storage.setState('user', user);

        let check = { valid: Boolean(user) };

        // If user is defined, perform scheme checks.
        if (check.valid) {
            check = this.check();
        }

        // Update `loggedIn` state
        this.$storage.setState('loggedIn', check.valid);
    }

    async request(endpoint: HTTPRequest, defaults: HTTPRequest = {}): Promise<HTTPResponse | void> {

        const request = typeof defaults === 'object' ? Object.assign({}, defaults, endpoint) : endpoint;
        const method = request.method ? request.method.toLowerCase() : 'get'

        if (request.baseURL === '') {
            // @ts-ignore
            request.baseURL = requrl(process.server ? this.ctx.ssrContext?.event.req : undefined);
        }

        if (!this.ctx.$http) {
            return Promise.reject(new Error('[AUTH] add the @nuxtjs-alt/http module to nuxt.config file'));
        }

        return this.ctx.$http['$' + method](request).catch((error: Error) => {
            // Call all error handlers
            this.callOnError(error, { method: 'request' });

            // Throw error
            return Promise.reject(error);
        });
    }

    async requestWith(endpoint?: HTTPRequest, defaults?: HTTPRequest): Promise<HTTPResponse | void> {
        const request = Object.assign({}, defaults, endpoint);

        if ((this.getStrategy() as TokenableScheme).token) {
            const token = (this.getStrategy() as TokenableScheme).token!.get();

            const tokenName = (this.getStrategy() as TokenableScheme).options.token!.name || 'Authorization';

            if (!request.headers) {
                request.headers = {};
            }

            if (!request.headers[tokenName as keyof typeof request.headers] && isSet(token) && token && typeof token === 'string') {
                request.headers[tokenName as keyof typeof request.headers] = token;
            }
        }

        return this.request(request);
    }

    async wrapLogin(promise: Promise<HTTPResponse | void>): Promise<HTTPResponse | void> {
        this.$storage.setState('busy', true);
        this.error = undefined;

        return Promise.resolve(promise).then((response) => {
            this.$storage.setState('busy', false)
            return response
        })
        .catch((error) => {
            this.$storage.setState('busy', false)
            return Promise.reject(error)
        })
    }

    onError(listener: ErrorListener): void {
        this.#errorListeners.push(listener);
    }

    callOnError(error: Error, payload = {}): void {
        this.error = error;

        for (const fn of this.#errorListeners) {
            fn(error, payload);
        }
    }

    /**
     * 
     * @param name redirect name
     * @param router (default: true) Whether to use nuxt redirect (true) or window redirect (false)
     *
     * @returns
     */
    redirect(name: string, router: boolean = true): void {
        const activeRouter = useRouter();
        const activeRoute = useRoute();

        if (!this.options.redirect) {
            return;
        }

        const route = this.options.fullPathRedirect ? activeRoute.fullPath : activeRoute.path
        const from = route;

        let to: string = this.options.redirect[name];

        if (!to) {
            return;
        }

        // Apply rewrites
        if (this.options.rewriteRedirects) {
            if (name === 'logout' && isRelativeURL(from) && !isSameURL(to, from)) {
                this.$storage.setUniversal('redirect', from);
            }

            if (name === 'login' && isRelativeURL(from) && !isSameURL(to, from)) {
                this.$storage.setUniversal('redirect', from);
            }

            if (name === 'home') {
                const redirect = this.$storage.getUniversal('redirect') as string;

                this.$storage.setUniversal('redirect', null);

                if (isRelativeURL(redirect)) {
                    to = redirect;
                }
            }
        }

        // Call onRedirect hook
        to = this.callOnRedirect(to, from) || to;

        // Prevent infinity redirects
        if (isSameURL(to, from)) {
            return;
        }

        const query = activeRoute.query;
        const queryString = Object.keys(query).map((key) => key + '=' + query[key]).join('&');

        if (!router) {
            window.location.replace(to + (queryString ? '?' + queryString : ''));
        } else {
            activeRouter.push(to + (queryString ? '?' + queryString : ''));
        }
    }

    onRedirect(listener: RedirectListener): void {
        this.#redirectListeners.push(listener);
    }

    callOnRedirect(to: string, from: string): string {
        for (const fn of this.#redirectListeners) {
            to = fn(to, from) || to;
        }
        return to;
    }

    hasScope(scope: string): boolean {
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

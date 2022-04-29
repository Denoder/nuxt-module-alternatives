import type {
    EndpointsOption,
    SchemePartialOptions,
    SchemeCheck,
    UserCookieOptions,
    HTTPRequest,
    HTTPResponse,
} from "../../types";
import { BaseScheme } from "./base";
import { getProp } from "../../utils";
import type { Auth } from "../core";
import { RequestHandler } from "../inc";

export interface CookieSchemeEndpoints extends EndpointsOption {
    login: HTTPRequest;
    logout: HTTPRequest | false;
    user: HTTPRequest | false;
    csrf: HTTPRequest | false;
}

export interface CookieSchemeCookie {
    name: string;
    server: boolean;
}

export interface CookieSchemeOptions {
    name: string;
    endpoints: CookieSchemeEndpoints;
    user: UserCookieOptions;
    cookie: CookieSchemeCookie;
}

const DEFAULTS: SchemePartialOptions<CookieSchemeOptions> = {
    name: "cookie",
    cookie: {
        name: null,
        server: false,
    },
    endpoints: {
        csrf: false,
        login: {
            url: "/api/auth/login",
            method: "post",
        },
        logout: {
            url: "/api/auth/logout",
            method: "post",
        },
        user: {
            url: "/api/auth/user",
            method: "get",
        },
    },
    user: {
        property: {
            client: false,
            server: false,
        },
        autoFetch: true,
    },
};

export class CookieScheme<
    OptionsT extends CookieSchemeOptions
> extends BaseScheme<OptionsT> {
    requestHandler: RequestHandler;

    constructor(
        $auth: Auth,
        options: SchemePartialOptions<CookieSchemeOptions>,
        ...defaults: SchemePartialOptions<CookieSchemeOptions>[]
    ) {
        super(
            $auth,
            options as OptionsT,
            ...(defaults as OptionsT[]),
            DEFAULTS as OptionsT
        );

        // Initialize Request Interceptor
        this.requestHandler = new RequestHandler(this, this.$auth.ctx.$axios);
    }

    mounted(): Promise<HTTPResponse | void> {
        if (process.server) {
            this.$auth.ctx.$axios.setHeader(
                "referer",
                // @ts-ignore
                this.$auth.ctx.ssrContext.req.headers.host
            );
        }

        // Initialize request interceptor
        this.initializeRequestInterceptor();

        if (this.isCookieServer() || this.isCookieClient()) {
            // Fetch user once
            return this.$auth.fetchUserOnce();
        }
    }

    check(): SchemeCheck {
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

    async login(endpoint: HTTPRequest): Promise<HTTPResponse> {
        // Ditch any leftover local tokens before attempting to log in
        this.$auth.reset();

        // Make CSRF request if required
        if (this.options.endpoints.csrf) {
            await this.$auth.request(this.options.endpoints.csrf, {
                maxRedirects: 0,
            });
        }

        if (!this.options.endpoints.login) {
            return;
        }

        // Make login request
        const response = await this.$auth.request(
            endpoint,
            this.options.endpoints.login
        );

        // Initialize request interceptor if not initialized
        if (!this.requestHandler.interceptor) {
            this.initializeRequestInterceptor();
        }

        // Fetch user if `autoFetch` is enabled
        if (this.options.user.autoFetch) {
            await this.fetchUser();
        }

        return response;
    }

    fetchUser(endpoint?: HTTPRequest): Promise<HTTPResponse | void> {
        // Cookie is required but not available

        if (this.isCookieServer() || this.isCookieClient()) {
            if (!this.check().valid) {
                return Promise.resolve();
            }
        }

        // User endpoint is disabled
        if (!this.options.endpoints.user) {
            this.$auth.setUser({});
            return Promise.resolve();
        }

        // Try to fetch user and then set
        return this.$auth
            .requestWith(endpoint, this.options.endpoints.user)
            .then((response) => {
                let userData: any;

                if (process.client) {
                    userData = getProp(
                        response.data,
                        this.options.user.property.client
                    );
                } else {
                    userData = getProp(
                        response.data,
                        this.options.user.property.server
                    );
                }

                if (!userData) {
                    const error = new Error(
                        `User Data response does not contain field ${this.options.user.property}`
                    );

                    return Promise.reject(error);
                }

                this.$auth.setUser(userData);

                return response;
            })
            .catch((error) => {
                this.$auth.callOnError(error, { method: "fetchUser" });
                return Promise.reject(error);
            });
    }

    async logout(endpoint: HTTPRequest = {}): Promise<void> {
        // Only connect to logout endpoint if it's configured
        if (this.options.endpoints.logout) {
            await this.$auth
                .requestWith(endpoint, this.options.endpoints.logout)
                .catch((err) => {
                    console.error(err);
                });
        }

        // But reset regardless
        return this.$auth.reset();
    }

    reset({ resetInterceptor = true } = {}): void {
        if (this.options.cookie.name) {
            this.$auth.$storage.setCookie(this.options.cookie.name, null, {
                prefix: "",
            });
        }

        this.$auth.setUser(false);

        if (resetInterceptor) {
            this.requestHandler.reset();
        }
    }

    protected isCookieServer(): boolean {
        return this.options.cookie.server && process.server;
    }

    protected isCookieClient(): boolean {
        return !this.options.cookie.server && process.client;
    }

    protected initializeRequestInterceptor(): void {
        this.requestHandler.initializeRequestInterceptor();
    }
}

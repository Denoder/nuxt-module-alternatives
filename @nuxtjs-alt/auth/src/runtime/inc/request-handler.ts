import type { TokenableScheme, RefreshableScheme } from "../../types";
import { ExpiredAuthSessionError } from "./expired-auth-session-error";
import { FetchInstance, FetchConfig } from "@refactorjs/ofetch"

export class RequestHandler {
    scheme: TokenableScheme | RefreshableScheme;
    http: FetchInstance;
    interceptor: number | undefined | null;

    constructor(scheme: TokenableScheme | RefreshableScheme, http: FetchInstance) {
        this.scheme = scheme;
        this.http = http;
        this.interceptor = null;
    }

    setHeader(token: string): void {
        if (this.scheme.options.token && this.scheme.options.token.global) {
            // Set Authorization token for all fetch requests
            this.http.setHeader(this.scheme.options.token.name, token);
        }
    }

    clearHeader(): void {
        if (this.scheme.options.token && this.scheme.options.token.global) {
            // Clear Authorization token for all fetch requests
            this.http.setHeader(this.scheme.options.token.name, null);
        }
    }

    // ---------------------------------------------------------------
    initializeRequestInterceptor(refreshEndpoint?: string | Request): void {
        this.interceptor = this.http.interceptors.request.use(
            async (config: FetchConfig) => {
                // Don't intercept refresh token requests
                if ((this.scheme.options.token && !this.#needToken(config)) || config.url === refreshEndpoint) {
                    return config;
                }

                // Perform scheme checks.
                const { valid, tokenExpired, refreshTokenExpired, isRefreshable } = this.scheme.check!(true);
                let isValid = valid;

                // Refresh token has expired. There is no way to refresh. Force reset.
                if (refreshTokenExpired) {
                    this.scheme.reset!();
                    throw new ExpiredAuthSessionError();
                }

                // Token has expired.
                if (tokenExpired) {
                    // Refresh token is not available. Force reset.
                    if (!isRefreshable) {
                        this.scheme.reset!();
                        throw new ExpiredAuthSessionError();
                    }

                    // Refresh token is available. Attempt refresh.
                    isValid = await (this.scheme as RefreshableScheme).refreshController
                        .handleRefresh()
                        .then(() => true)
                        .catch(() => {
                            // Tokens couldn't be refreshed. Force reset.
                            this.scheme.reset!();
                            throw new ExpiredAuthSessionError();
                        });
                }

                // Sync token
                const token = this.scheme.token;

                // Scheme checks were performed, but returned that is not valid.
                if (!isValid) {
                    // The authorization header in the current request is expired.
                    // Token was deleted right before this request
                    if (token && !token.get() && this.#requestHasAuthorizationHeader(config)) {
                        throw new ExpiredAuthSessionError();
                    }

                    return config;
                }

                // Token is valid, let the request pass
                // Fetch updated token and add to current request
                return this.#getUpdatedRequestConfig(config, token ? token.get() : false);
            }
        );
    }

    reset(): void {
        // Eject request interceptor
        this.http.interceptors.request.eject(this.interceptor as number);
        this.interceptor = null;
    }

    #needToken(config: any): boolean {
        const options = this.scheme.options;

        return ( options.token!.global || Object.values(options.endpoints).some((endpoint: any) => typeof endpoint === "object" ? endpoint.url === config.url : endpoint === config.url));
    }

    // ---------------------------------------------------------------
    // Watch requests for token expiration
    // Refresh tokens if token has expired

    #getUpdatedRequestConfig(config: any, token: string | boolean) {
        if (typeof token === "string") {
            config.headers[this.scheme.options.token!.name] = token;
        }

        return config;
    }

    #requestHasAuthorizationHeader(config: FetchConfig): boolean {
        return !!config.headers[this.scheme.options.token!.name];
    }
}

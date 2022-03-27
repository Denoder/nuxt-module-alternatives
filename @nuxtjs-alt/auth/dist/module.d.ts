import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { RouteLocationNormalized } from 'vue-router';
import { NuxtApp } from '#app';
import { NuxtAxiosInstance } from '@nuxtjs-alt/axios';
import * as NuxtSchema from '@nuxt/schema';

declare type OpenIDConnectConfigurationDocument = {
    issuer?: string;
    authorization_endpoint?: string;
    token_endpoint?: string;
    token_endpoint_auth_methods_supported?: string[];
    token_endpoint_auth_signing_alg_values_supported?: string[];
    userinfo_endpoint?: string;
    check_session_iframe?: string;
    end_session_endpoint?: string;
    jwks_uri?: string;
    registration_endpoint?: string;
    scopes_supported?: string[];
    response_types_supported?: string[];
    acr_values_supported?: string[];
    response_modes_supported?: string[];
    grant_types_supported?: string[];
    subject_types_supported?: string[];
    userinfo_signing_alg_values_supported?: string[];
    userinfo_encryption_alg_values_supported?: string[];
    userinfo_encryption_enc_values_supported?: string[];
    id_token_signing_alg_values_supported?: string[];
    id_token_encryption_alg_values_supported?: string[];
    id_token_encryption_enc_values_supported?: string[];
    request_object_signing_alg_values_supported?: string[];
    display_values_supported?: string[];
    claim_types_supported?: string[];
    claims_supported?: string[];
    claims_parameter_supported?: boolean;
    service_documentation?: string;
    ui_locales_supported?: string[];
};

interface ModuleOptions {
    globalMiddleware?: boolean;
    plugins?: Array<string | {
        src: string;
        ssr: boolean;
    }>;
    ignoreExceptions: boolean;
    resetOnError: boolean | ((...args: unknown[]) => boolean);
    defaultStrategy: string | undefined;
    watchLoggedIn: boolean;
    rewriteRedirects: boolean;
    fullPathRedirect: boolean;
    scopeKey: string;
    redirect: {
        login: string;
        logout: string;
        callback: string;
        home: string;
    };
    pinia: {
        namespace: string;
    };
    cookie: {
        prefix: string;
        options: {
            path: string;
            expires?: number | Date;
            maxAge?: number;
            domain?: string;
            secure?: boolean;
        };
    } | false;
    localStorage: {
        prefix: string;
    } | false;
    strategies: {
        [strategy: string]: Strategy;
    };
}
declare const moduleDefaults: ModuleOptions;

declare type StorageOptions = ModuleOptions & {
    initialState: {
        user: null;
        loggedIn: boolean;
    };
};
declare class Storage {
    #private;
    ctx: NuxtApp;
    options: StorageOptions;
    state: any;
    constructor(ctx: NuxtApp, options: StorageOptions);
    setUniversal<V extends unknown>(key: string, value: V): V | void;
    getUniversal(key: string): unknown;
    syncUniversal(key: string, defaultValue?: unknown): unknown;
    removeUniversal(key: string): void;
    getStore(pinia: any): any;
    setState<V extends unknown>(key: string, value: V): V;
    getState(key: string): unknown;
    watchState(watchKey: string, fn: (value: unknown) => void): () => void;
    removeState(key: string): void;
    setLocalStorage<V extends unknown>(key: string, value: V): V | void;
    getLocalStorage(key: string): unknown;
    removeLocalStorage(key: string): void;
    getCookies(): Record<string, unknown>;
    setCookie<V extends unknown>(key: string, value: V, options?: {
        prefix?: string;
    }): V;
    getCookie(key: string): unknown;
    removeCookie(key: string, options?: {
        prefix?: string;
    }): void;
    getPrefix(): string;
    isLocalStorageEnabled(): boolean;
    isCookiesEnabled(): boolean;
}

declare type ErrorListener = (...args: unknown[]) => void;
declare type RedirectListener = (to: string, from: string) => string;
declare class Auth {
    #private;
    ctx: NuxtApp;
    options: ModuleOptions;
    strategies: Record<string, Scheme>;
    error: Error;
    $storage: Storage;
    $state: any;
    constructor(ctx: NuxtApp, options: ModuleOptions);
    get strategy(): Scheme;
    getStrategy(throwException?: boolean): Scheme | TokenableScheme | RefreshableScheme;
    get user(): Record<string, unknown> | null;
    get loggedIn(): boolean;
    get busy(): boolean;
    init(): Auth | void;
    registerStrategy(name: string, strategy: Scheme): void;
    setStrategy(name: string): Promise<HTTPResponse | void>;
    mounted(...args: unknown[]): Promise<HTTPResponse | void>;
    loginWith(name: string, ...args: unknown[]): Promise<HTTPResponse | void>;
    login(...args: unknown[]): Promise<HTTPResponse | void>;
    fetchUser(...args: unknown[]): Promise<HTTPResponse | void>;
    logout(...args: unknown[]): Promise<void>;
    setUserToken(token: string | boolean, refreshToken?: string | boolean): Promise<HTTPResponse | void>;
    reset(...args: unknown[]): void;
    refreshTokens(): Promise<HTTPResponse | void>;
    check(...args: unknown[]): SchemeCheck;
    fetchUserOnce(...args: unknown[]): Promise<HTTPResponse | void>;
    setUser(user: unknown): void;
    request(endpoint: HTTPRequest, defaults?: HTTPRequest): Promise<HTTPResponse>;
    requestWith(endpoint: HTTPRequest, defaults?: HTTPRequest): Promise<HTTPResponse>;
    wrapLogin(promise: Promise<HTTPResponse | void>): Promise<HTTPResponse | void>;
    onError(listener: ErrorListener): void;
    callOnError(error: Error, payload?: {}): void;
    redirect(name: string, opt?: {
        route?: any;
        noRouter?: boolean;
    }): void;
    onRedirect(listener: RedirectListener): void;
    callOnRedirect(to: string, from: string): string;
    hasScope(scope: string): boolean;
}

declare const middleware: (to: RouteLocationNormalized, from: RouteLocationNormalized) => void;

declare class ConfigurationDocumentRequestError extends Error {
    constructor();
}

declare class BaseScheme<OptionsT extends SchemeOptions> {
    $auth: Auth;
    options: OptionsT;
    constructor($auth: Auth, ...options: OptionsT[]);
    get name(): string;
}

interface CookieSchemeEndpoints extends EndpointsOption {
    login: HTTPRequest;
    logout: HTTPRequest | false;
    user: HTTPRequest | false;
    csrf: HTTPRequest | false;
}
interface CookieSchemeCookie {
    name: string;
    server: boolean;
}
interface CookieSchemeOptions {
    name: string;
    endpoints: CookieSchemeEndpoints;
    user: UserCookieOptions;
    cookie: CookieSchemeCookie;
}
declare class CookieScheme<OptionsT extends CookieSchemeOptions> extends BaseScheme<OptionsT> {
    requestHandler: RequestHandler;
    constructor($auth: Auth, options: SchemePartialOptions<CookieSchemeOptions>, ...defaults: SchemePartialOptions<CookieSchemeOptions>[]);
    mounted(): Promise<HTTPResponse | void>;
    check(): SchemeCheck;
    login(endpoint: HTTPRequest): Promise<HTTPResponse>;
    fetchUser(endpoint?: HTTPRequest): Promise<HTTPResponse | void>;
    logout(endpoint?: HTTPRequest): Promise<void>;
    reset({ resetInterceptor }?: {
        resetInterceptor?: boolean;
    }): void;
    protected isCookieServer(): boolean;
    protected isCookieClient(): boolean;
    protected initializeRequestInterceptor(): void;
}

interface LocalSchemeEndpoints extends EndpointsOption {
    login: HTTPRequest;
    logout: HTTPRequest | false;
    user: HTTPRequest | false;
}
interface LocalSchemeOptions extends TokenableSchemeOptions {
    endpoints: LocalSchemeEndpoints;
    user: UserOptions;
    clientId: string | false;
    grantType: string | false;
    scope: string[] | false;
}
declare class LocalScheme<OptionsT extends LocalSchemeOptions = LocalSchemeOptions> extends BaseScheme<OptionsT> implements TokenableScheme<OptionsT> {
    token: Token;
    requestHandler: RequestHandler;
    constructor($auth: Auth, options: SchemePartialOptions<LocalSchemeOptions>, ...defaults: SchemePartialOptions<LocalSchemeOptions>[]);
    check(checkStatus?: boolean): SchemeCheck;
    mounted({ tokenCallback, refreshTokenCallback, }?: {
        tokenCallback?: () => void;
        refreshTokenCallback?: any;
    }): Promise<HTTPResponse | void>;
    login(endpoint: HTTPRequest, { reset }?: {
        reset?: boolean;
    }): Promise<HTTPResponse>;
    setUserToken(token: string): Promise<HTTPResponse | void>;
    fetchUser(endpoint?: HTTPRequest): Promise<HTTPResponse | void>;
    logout(endpoint?: HTTPRequest): Promise<void>;
    reset({ resetInterceptor }?: {
        resetInterceptor?: boolean;
    }): void;
    protected updateTokens(response: HTTPResponse): void;
    protected initializeRequestInterceptor(): void;
}

interface Oauth2SchemeEndpoints extends EndpointsOption {
    authorization: string;
    token: string;
    userInfo: string;
    logout: string | false;
}
interface Oauth2SchemeOptions extends SchemeOptions, TokenableSchemeOptions, RefreshableSchemeOptions {
    endpoints: Oauth2SchemeEndpoints;
    user: UserOptions;
    responseMode: "query.jwt" | "fragment.jwt" | "form_post.jwt" | "jwt";
    responseType: "code" | "token" | "id_token" | "none" | string;
    grantType: "implicit" | "authorization_code" | "client_credentials" | "password" | "refresh_token" | "urn:ietf:params:oauth:grant-type:device_code";
    accessType: "online" | "offline";
    redirectUri: string;
    logoutRedirectUri: string;
    clientId: string | number;
    clientSecretTransport: "body" | "aurthorization_header";
    scope: string | string[];
    state: string;
    codeChallengeMethod: "implicit" | "S256" | "plain";
    acrValues: string;
    audience: string;
    autoLogout: boolean;
}
declare class Oauth2Scheme<OptionsT extends Oauth2SchemeOptions = Oauth2SchemeOptions> extends BaseScheme<OptionsT> implements RefreshableScheme {
    #private;
    req: any;
    token: Token;
    refreshToken: RefreshToken;
    refreshController: RefreshController;
    requestHandler: RequestHandler;
    constructor($auth: Auth, options: SchemePartialOptions<Oauth2SchemeOptions>, ...defaults: SchemePartialOptions<Oauth2SchemeOptions>[]);
    protected get scope(): string;
    protected get redirectURI(): string;
    protected get logoutRedirectURI(): string;
    check(checkStatus?: boolean): SchemeCheck;
    mounted(): Promise<HTTPResponse | void>;
    reset(): void;
    login(_opts?: {
        state?: string;
        params?: any;
        nonce?: string;
    }): Promise<void>;
    logout(): void;
    fetchUser(): Promise<void>;
    refreshTokens(): Promise<HTTPResponse | void>;
    protected updateTokens(response: HTTPResponse): void;
    protected pkceChallengeFromVerifier(v: string, hashValue: boolean): Promise<string>;
    protected generateRandomString(): string;
}

interface OpenIDConnectSchemeEndpoints extends Oauth2SchemeEndpoints {
    configuration: string;
}
interface OpenIDConnectSchemeOptions extends Oauth2SchemeOptions, IdTokenableSchemeOptions {
    endpoints: OpenIDConnectSchemeEndpoints;
}
declare class OpenIDConnectScheme<OptionsT extends OpenIDConnectSchemeOptions = OpenIDConnectSchemeOptions> extends Oauth2Scheme<OptionsT> {
    #private;
    idToken: IdToken;
    configurationDocument: ConfigurationDocument;
    constructor($auth: Auth, options: SchemePartialOptions<OpenIDConnectSchemeOptions>, ...defaults: SchemePartialOptions<OpenIDConnectSchemeOptions>[]);
    protected updateTokens(response: HTTPResponse): void;
    check(checkStatus?: boolean): SchemeCheck;
    mounted(): Promise<void | HTTPResponse>;
    reset(): void;
    logout(): void;
    fetchUser(): Promise<void>;
}

interface RefreshSchemeEndpoints extends LocalSchemeEndpoints {
    refresh: HTTPRequest;
}
interface RefreshSchemeOptions extends LocalSchemeOptions, RefreshableSchemeOptions {
    endpoints: RefreshSchemeEndpoints;
    autoLogout: boolean;
}
declare class RefreshScheme<OptionsT extends RefreshSchemeOptions = RefreshSchemeOptions> extends LocalScheme<OptionsT> implements RefreshableScheme<OptionsT> {
    refreshToken: RefreshToken;
    refreshController: RefreshController;
    constructor($auth: Auth, options: SchemePartialOptions<RefreshSchemeOptions>);
    check(checkStatus?: boolean): SchemeCheck;
    mounted(): Promise<HTTPResponse | void>;
    refreshTokens(): Promise<HTTPResponse | void>;
    setUserToken(token: string | boolean, refreshToken?: string | boolean): Promise<HTTPResponse | void>;
    reset({ resetInterceptor }?: {
        resetInterceptor?: boolean;
    }): void;
    protected updateTokens(response: HTTPResponse, { isRefreshing, updateOnRefresh }?: {
        isRefreshing?: boolean;
        updateOnRefresh?: boolean;
    }): void;
    protected initializeRequestInterceptor(): void;
}

declare class Auth0Scheme extends Oauth2Scheme {
    logout(): void;
}

declare class LaravelJWTScheme extends RefreshScheme {
    protected updateTokens(response: HTTPResponse, { isRefreshing, updateOnRefresh }?: {
        isRefreshing?: boolean;
        updateOnRefresh?: boolean;
    }): void;
}

/**
 * A metadata document that contains most of the OpenID Provider's information,
 * such as the URLs to use and the location of the service's public signing keys.
 * You can find this document by appending the discovery document path
 * (/.well-known/openid-configuration) to the authority URL(https://example.com)
 * Eg. https://example.com/.well-known/openid-configuration
 *
 * More info: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
 */
declare class ConfigurationDocument {
    #private;
    scheme: OpenIDConnectScheme;
    $storage: Storage;
    key: string;
    constructor(scheme: OpenIDConnectScheme, storage: Storage);
    get(): OpenIDConnectConfigurationDocument;
    set(value: OpenIDConnectConfigurationDocument | boolean): boolean | OpenIDConnectConfigurationDocument;
    request(): Promise<void>;
    validate(): void;
    init(): Promise<void>;
    setSchemeEndpoints(): void;
    reset(): void;
}

declare class ExpiredAuthSessionError extends Error {
    constructor();
}

declare class RefreshController {
    #private;
    scheme: RefreshableScheme;
    $auth: Auth;
    constructor(scheme: RefreshableScheme);
    handleRefresh(): Promise<HTTPResponse | void>;
}

declare enum TokenStatusEnum {
    UNKNOWN = "UNKNOWN",
    VALID = "VALID",
    EXPIRED = "EXPIRED"
}
declare class TokenStatus {
    #private;
    constructor(token: string | boolean, tokenExpiresAt: number | false);
    unknown(): boolean;
    valid(): boolean;
    expired(): boolean;
}

declare class RefreshToken {
    #private;
    scheme: RefreshableScheme;
    $storage: Storage;
    constructor(scheme: RefreshableScheme, storage: Storage);
    get(): string | boolean;
    set(tokenValue: string | boolean): string | boolean;
    sync(): string | boolean;
    reset(): void;
    status(): TokenStatus;
}

declare class RequestHandler {
    #private;
    scheme: TokenableScheme | RefreshableScheme;
    axios: NuxtAxiosInstance;
    interceptor: number;
    constructor(scheme: TokenableScheme | RefreshableScheme, axios: NuxtAxiosInstance);
    setHeader(token: string): void;
    clearHeader(): void;
    initializeRequestInterceptor(refreshEndpoint?: string): void;
    reset(): void;
}

declare class Token {
    #private;
    scheme: TokenableScheme;
    $storage: Storage;
    constructor(scheme: TokenableScheme, storage: Storage);
    get(): string | boolean;
    set(tokenValue: string | boolean): string | boolean;
    sync(): string | boolean;
    reset(): void;
    status(): TokenStatus;
}

declare class IdToken {
    #private;
    scheme: IdTokenableScheme;
    $storage: Storage;
    constructor(scheme: IdTokenableScheme, storage: Storage);
    get(): string | boolean;
    set(tokenValue: string | boolean): string | boolean;
    sync(): string | boolean;
    reset(): void;
    status(): TokenStatus;
    userInfo(): unknown;
}

declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : RecursivePartial<T[P]>;
};
declare type PartialExcept<T, K extends keyof T> = RecursivePartial<T> & Pick<T, K>;

interface UserOptions {
    property?: string | false;
    autoFetch: boolean;
}
interface UserCookieOptions {
    property: {
        client: string | false;
        server: string | false;
    };
    autoFetch: boolean;
}
interface EndpointsOption {
    [endpoint: string]: string | HTTPRequest | false;
}
interface SchemeOptions {
    name: string;
}
declare type SchemePartialOptions<Options extends SchemeOptions> = PartialExcept<Options, keyof SchemeOptions>;
interface SchemeCheck {
    valid: boolean;
    tokenExpired?: boolean;
    refreshTokenExpired?: boolean;
    idTokenExpired?: boolean;
    isRefreshable?: boolean;
}
interface Scheme<OptionsT extends SchemeOptions = SchemeOptions> {
    options: OptionsT;
    name?: string;
    $auth: Auth;
    mounted?(...args: unknown[]): Promise<HTTPResponse | void>;
    check?(checkStatus: boolean): SchemeCheck;
    login(...args: unknown[]): Promise<HTTPResponse | void>;
    fetchUser(endpoint?: HTTPRequest): Promise<HTTPResponse | void>;
    setUserToken?(token: string | boolean, refreshToken?: string | boolean): Promise<HTTPResponse | void>;
    logout?(endpoint?: HTTPRequest): Promise<void> | void;
    reset?(options?: {
        resetInterceptor: boolean;
    }): void;
}
interface TokenOptions {
    property: string;
    type: string | false;
    name: string;
    maxAge: number | false;
    global: boolean;
    required: boolean;
    prefix: string;
    expirationPrefix: string;
}
interface TokenableSchemeOptions extends SchemeOptions {
    token?: TokenOptions;
    endpoints: EndpointsOption;
}
interface TokenableScheme<OptionsT extends TokenableSchemeOptions = TokenableSchemeOptions> extends Scheme<OptionsT> {
    token?: Token;
    requestHandler: RequestHandler;
}
interface IdTokenableSchemeOptions extends SchemeOptions {
    idToken: TokenOptions;
}
interface IdTokenableScheme<OptionsT extends IdTokenableSchemeOptions = IdTokenableSchemeOptions> extends Scheme<OptionsT> {
    idToken: IdToken;
    requestHandler: RequestHandler;
}
interface RefreshTokenOptions {
    property: string | false;
    type: string | false;
    data: string | false;
    maxAge: number | false;
    required: boolean;
    tokenRequired: boolean;
    prefix: string;
    expirationPrefix: string;
}
interface RefreshableSchemeOptions extends TokenableSchemeOptions {
    refreshToken: RefreshTokenOptions;
}
interface RefreshableScheme<OptionsT extends RefreshableSchemeOptions = RefreshableSchemeOptions> extends TokenableScheme<OptionsT> {
    refreshToken: RefreshToken;
    refreshController: RefreshController;
    refreshTokens(): Promise<HTTPResponse | void>;
}

interface ProviderOptions {
    scheme: string;
    clientSecret: string | number;
}
declare type ProviderOptionsKeys = Exclude<keyof ProviderOptions, "clientSecret">;
declare type ProviderPartialOptions<Options extends ProviderOptions & SchemeOptions> = PartialExcept<Options, ProviderOptionsKeys>;

declare type HTTPRequest = AxiosRequestConfig;
declare type HTTPResponse = AxiosResponse;

interface VueComponent {
    options: object;
    _Ctor: VueComponent;
}
declare type MatchedRoute = {
    components: VueComponent[];
};
declare type Route = {
    matched: MatchedRoute[];
};

interface Strategy extends SchemeOptions {
    provider?: string | ((...args: unknown[]) => unknown);
    scheme: string;
    enabled: boolean;
    [option: string]: unknown;
}
declare type StrategyOptions<SOptions extends SchemeOptions = SchemeOptions> = ProviderPartialOptions<ProviderOptions & SOptions>;

interface Auth0ProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
    domain: string;
}
declare function auth0(nuxt: any, strategy: ProviderPartialOptions<Auth0ProviderOptions>): void;

interface DiscordProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
}
declare function discord(nuxt: any, strategy: ProviderPartialOptions<DiscordProviderOptions>): void;

interface FacebookProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
}
declare function facebook(nuxt: any, strategy: ProviderPartialOptions<FacebookProviderOptions>): void;

interface GithubProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
}
declare function github(nuxt: any, strategy: ProviderPartialOptions<GithubProviderOptions>): void;

interface GoogleProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
}
declare function google(nuxt: any, strategy: ProviderPartialOptions<GoogleProviderOptions>): void;

interface LaravelJWTProviderOptions extends ProviderOptions, RefreshSchemeOptions {
    url: string;
}
declare function laravelJWT(nuxt: any, strategy: ProviderPartialOptions<LaravelJWTProviderOptions>): void;

interface LaravelPassportProviderOptions extends ProviderOptions, Oauth2SchemeOptions {
    url: string;
}
interface LaravelPassportPasswordProviderOptions extends ProviderOptions, RefreshSchemeOptions {
    url: string;
}
declare type PartialPassportOptions = ProviderPartialOptions<LaravelPassportProviderOptions>;
declare type PartialPassportPasswordOptions = ProviderPartialOptions<LaravelPassportPasswordProviderOptions>;
declare function laravelPassport(nuxt: any, strategy: PartialPassportOptions | PartialPassportPasswordOptions): void;

interface LaravelSanctumProviderOptions extends ProviderOptions, CookieSchemeOptions {
    url: string;
}
declare function laravelSanctum(nuxt: any, strategy: ProviderPartialOptions<LaravelSanctumProviderOptions>): void;

declare const ProviderAliases: {
    "laravel/jwt": string;
    "laravel/passport": string;
    "laravel/sanctum": string;
};

declare module "@nuxt/schema" {
    interface NuxtConfig {
        ["auth"]?: Partial<ModuleOptions>;
    }
    interface NuxtOptions {
        ["auth"]?: ModuleOptions;
    }
}

declare const module: NuxtSchema.NuxtModule<ModuleOptions>;

declare module "#app" {
    interface NuxtApp {
        $auth: Auth;
    }
    interface NuxtConfig {
        auth: ModuleOptions;
    }
}

export { Auth, Auth0ProviderOptions, Auth0Scheme, middleware as AuthMiddleware, BaseScheme, ConfigurationDocument, ConfigurationDocumentRequestError, CookieScheme, CookieSchemeCookie, CookieSchemeEndpoints, CookieSchemeOptions, DiscordProviderOptions, EndpointsOption, ErrorListener, ExpiredAuthSessionError, FacebookProviderOptions, GithubProviderOptions, GoogleProviderOptions, HTTPRequest, HTTPResponse, IdToken, IdTokenableScheme, IdTokenableSchemeOptions, LaravelJWTProviderOptions, LaravelJWTScheme, LaravelPassportPasswordProviderOptions, LaravelPassportProviderOptions, LaravelSanctumProviderOptions, LocalScheme, LocalSchemeEndpoints, LocalSchemeOptions, MatchedRoute, ModuleOptions, Oauth2Scheme, Oauth2SchemeEndpoints, Oauth2SchemeOptions, OpenIDConnectConfigurationDocument, OpenIDConnectScheme, OpenIDConnectSchemeEndpoints, OpenIDConnectSchemeOptions, PartialExcept, PartialPassportOptions, PartialPassportPasswordOptions, ProviderAliases, ProviderOptions, ProviderOptionsKeys, ProviderPartialOptions, RecursivePartial, RedirectListener, RefreshController, RefreshScheme, RefreshSchemeEndpoints, RefreshSchemeOptions, RefreshToken, RefreshTokenOptions, RefreshableScheme, RefreshableSchemeOptions, RequestHandler, Route, Scheme, SchemeCheck, SchemeOptions, SchemePartialOptions, Storage, StorageOptions, Strategy, StrategyOptions, Token, TokenOptions, TokenStatus, TokenStatusEnum, TokenableScheme, TokenableSchemeOptions, UserCookieOptions, UserOptions, VueComponent, auth0, module as default, discord, facebook, github, google, laravelJWT, laravelPassport, laravelSanctum, moduleDefaults };

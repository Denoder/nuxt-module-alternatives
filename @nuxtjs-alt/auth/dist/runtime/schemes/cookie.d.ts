import type { EndpointsOption, SchemePartialOptions, SchemeCheck, UserCookieOptions, HTTPRequest, HTTPResponse } from "../../types";
import { BaseScheme } from "./base";
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
export declare class CookieScheme<OptionsT extends CookieSchemeOptions> extends BaseScheme<OptionsT> {
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

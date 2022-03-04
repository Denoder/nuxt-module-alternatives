import type { EndpointsOption, SchemePartialOptions, SchemeCheck, UserOptions, HTTPRequest, HTTPResponse } from '../../types';
import { BaseScheme } from './base';
import type { Auth } from '../core';
import { RequestHandler } from '../inc';
export interface CookieSchemeEndpoints extends EndpointsOption {
    login: HTTPRequest;
    logout: HTTPRequest | false;
    user: HTTPRequest | false;
}
export interface CookieSchemeCookie {
    name: string;
}
export interface CookieSchemeOptions {
    endpoints: CookieSchemeEndpoints;
    user: UserOptions;
    cookie: CookieSchemeCookie;
    csrf: HTTPRequest;
}
export declare class CookieScheme<OptionsT extends CookieSchemeOptions = CookieSchemeOptions> extends BaseScheme<OptionsT> {
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
    protected initializeRequestInterceptor(): void;
}

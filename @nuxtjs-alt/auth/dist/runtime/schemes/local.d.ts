import type { EndpointsOption, SchemePartialOptions, TokenableSchemeOptions, TokenableScheme, UserOptions, HTTPRequest, HTTPResponse, SchemeCheck } from "../../types";
import type { Auth } from "../core";
import { Token, RequestHandler } from "../inc";
import { BaseScheme } from "./base";
export interface LocalSchemeEndpoints extends EndpointsOption {
    login: HTTPRequest;
    logout: HTTPRequest | false;
    user: HTTPRequest | false;
}
export interface LocalSchemeOptions extends TokenableSchemeOptions {
    endpoints: LocalSchemeEndpoints;
    user: UserOptions;
    clientId: string | false;
    grantType: string | false;
    scope: string[] | false;
}
export declare class LocalScheme<OptionsT extends LocalSchemeOptions = LocalSchemeOptions> extends BaseScheme<OptionsT> implements TokenableScheme<OptionsT> {
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

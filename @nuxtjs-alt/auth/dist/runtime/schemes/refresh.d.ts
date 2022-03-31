import type { RefreshableScheme, SchemePartialOptions, SchemeCheck, HTTPResponse, HTTPRequest, RefreshableSchemeOptions } from "../../types";
import type { Auth } from "../core";
import { RefreshController, RefreshToken } from "../inc";
import { LocalScheme, LocalSchemeEndpoints, LocalSchemeOptions } from "./local";
export interface RefreshSchemeEndpoints extends LocalSchemeEndpoints {
    refresh: HTTPRequest;
}
export interface RefreshSchemeOptions extends LocalSchemeOptions, RefreshableSchemeOptions {
    endpoints: RefreshSchemeEndpoints;
    autoLogout: boolean;
}
export declare class RefreshScheme<OptionsT extends RefreshSchemeOptions = RefreshSchemeOptions> extends LocalScheme<OptionsT> implements RefreshableScheme<OptionsT> {
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

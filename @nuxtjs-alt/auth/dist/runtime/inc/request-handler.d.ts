import type { TokenableScheme, RefreshableScheme } from '../../types';
export declare class RequestHandler {
    scheme: TokenableScheme | RefreshableScheme;
    axios: any;
    interceptor: number;
    constructor(scheme: TokenableScheme | RefreshableScheme | any, axios: any);
    setHeader(token: string): void;
    clearHeader(): void;
    initializeRequestInterceptor(refreshEndpoint?: string): void;
    reset(): void;
    private _needToken;
    private _getUpdatedRequestConfig;
    private _requestHasAuthorizationHeader;
}

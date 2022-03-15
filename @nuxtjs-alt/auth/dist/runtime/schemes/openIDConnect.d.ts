import { IdTokenableSchemeOptions } from '../../types';
import { IdToken, ConfigurationDocument } from '../inc';
import type { Auth, HTTPResponse, SchemeCheck, SchemePartialOptions } from '../../index';
import { Oauth2Scheme, Oauth2SchemeEndpoints, Oauth2SchemeOptions } from './oauth2';
export interface OpenIDConnectSchemeEndpoints extends Oauth2SchemeEndpoints {
    configuration: string;
}
export interface OpenIDConnectSchemeOptions extends Oauth2SchemeOptions, IdTokenableSchemeOptions {
    endpoints: OpenIDConnectSchemeEndpoints;
}
export declare class OpenIDConnectScheme<OptionsT extends OpenIDConnectSchemeOptions = OpenIDConnectSchemeOptions> extends Oauth2Scheme<OptionsT> {
    idToken: IdToken;
    configurationDocument: ConfigurationDocument;
    constructor($auth: Auth, options: SchemePartialOptions<OpenIDConnectSchemeOptions>, ...defaults: SchemePartialOptions<OpenIDConnectSchemeOptions>[]);
    protected updateTokens(response: HTTPResponse): void;
    check(checkStatus?: boolean): SchemeCheck;
    mounted(): Promise<void | HTTPResponse>;
    reset(): void;
    logout(): void;
    fetchUser(): Promise<void>;
    _handleCallback(): Promise<boolean>;
}

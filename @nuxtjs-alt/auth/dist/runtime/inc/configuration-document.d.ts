import { OpenIDConnectScheme } from "../schemes";
import { OpenIDConnectConfigurationDocument } from "../../types";
import { Storage } from "../core/storage";
/**
 * A metadata document that contains most of the OpenID Provider's information,
 * such as the URLs to use and the location of the service's public signing keys.
 * You can find this document by appending the discovery document path
 * (/.well-known/openid-configuration) to the authority URL(https://example.com)
 * Eg. https://example.com/.well-known/openid-configuration
 *
 * More info: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
 */
export declare class ConfigurationDocument {
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

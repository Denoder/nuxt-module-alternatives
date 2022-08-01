import { defu } from "defu";
import { OpenIDConnectScheme, OpenIDConnectSchemeEndpoints } from "../schemes";
import { OpenIDConnectConfigurationDocument } from "../../types";
import { Storage } from "../core/storage";
import { ConfigurationDocumentRequestError } from "./configuration-document-request-error";

// eslint-disable-next-line no-console
const ConfigurationDocumentWarning = (message: string) =>
    console.warn(`[AUTH] [OPENID CONNECT] Invalid configuration. ${message}`);

/**
 * A metadata document that contains most of the OpenID Provider's information,
 * such as the URLs to use and the location of the service's public signing keys.
 * You can find this document by appending the discovery document path
 * (/.well-known/openid-configuration) to the authority URL(https://example.com)
 * Eg. https://example.com/.well-known/openid-configuration
 *
 * More info: https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
 */
export class ConfigurationDocument {
    scheme: OpenIDConnectScheme;
    $storage: Storage;
    key: string;

    constructor(scheme: OpenIDConnectScheme, storage: Storage) {
        this.scheme = scheme;
        this.$storage = storage;
        this.key = "_configuration_document." + this.scheme.name;
    }

    #set(value: OpenIDConnectConfigurationDocument | boolean) {
        return this.$storage.setState(this.key, value);
    }

    get(): OpenIDConnectConfigurationDocument {
        return this.$storage.getState(this.key);
    }

    set(value: OpenIDConnectConfigurationDocument | boolean) {
        this.#set(value);

        return value;
    }

    async request() {
        // Get Configuration document from state hydration
        const serverDoc: OpenIDConnectConfigurationDocument = this.scheme.$auth.ctx?.payload?.data?.$auth?.openIDConnect?.configurationDocument;

        if (process.client && serverDoc) {
            this.set(serverDoc);
        }

        if (!this.get()) {
            const configurationDocument = await this.scheme.requestHandler.axios.$get(this.scheme.options.endpoints.configuration).catch((e) => Promise.reject(e));

            // Push Configuration document to state hydration
            if (process.server) {
                this.scheme.$auth.ctx.payload.data.$auth = {
                    /* use `openIDConnect` instead of `oidc` because it could not be picked up by `serverDoc` */
                    openIDConnect: {
                        configurationDocument
                    }
                }
            }

            this.set(configurationDocument);
        }
    }

    validate() {
        const mapping = {
            responseType: "response_types_supported",
            scope: "scopes_supported",
            grantType: "grant_types_supported",
            acrValues: "acr_values_supported",
        };

        Object.keys(mapping).forEach((optionsKey) => {
            const configDocument = this.get();
            const configDocumentKey = mapping[optionsKey];
            const configDocumentValues = configDocument[configDocumentKey];
            const optionsValues = this.scheme.options[optionsKey];

            if (typeof configDocumentValues !== "undefined") {
                if (
                    Array.isArray(optionsValues) &&
                    Array.isArray(configDocumentValues)
                ) {
                    optionsValues.forEach((optionsValue) => {
                        if (!configDocumentValues.includes(optionsValue)) {
                            ConfigurationDocumentWarning(
                                `A value of scheme options ${optionsKey} is not supported by ${configDocumentKey} of by Authorization Server.`
                            );
                        }
                    });
                }

                if (
                    !Array.isArray(optionsValues) &&
                    Array.isArray(configDocumentValues) &&
                    !configDocumentValues.includes(optionsValues)
                ) {
                    ConfigurationDocumentWarning(
                        `Value of scheme option ${optionsKey} is not supported by ${configDocumentKey} of by Authorization Server.`
                    );
                }

                if (
                    !Array.isArray(optionsValues) &&
                    !Array.isArray(configDocumentValues) &&
                    configDocumentValues !== optionsValues
                ) {
                    ConfigurationDocumentWarning(
                        `Value of scheme option ${optionsKey} is not supported by ${configDocumentKey} of by Authorization Server.`
                    );
                }
            }
        });
    }

    async init() {
        await this.request().catch(() => {
            throw new ConfigurationDocumentRequestError();
        });
        this.validate();
        this.setSchemeEndpoints();
    }

    setSchemeEndpoints() {
        const configurationDocument = this.get();

        this.scheme.options.endpoints = defu(this.scheme.options.endpoints, {
            authorization: configurationDocument.authorization_endpoint,
            token: configurationDocument.token_endpoint,
            userInfo: configurationDocument.userinfo_endpoint,
            logout: configurationDocument.end_session_endpoint,
        }) as OpenIDConnectSchemeEndpoints;
    }

    reset() {
        this.#set(false);
    }
}

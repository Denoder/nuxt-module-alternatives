// @ts-ignore
import jwtDecode, { JwtPayload } from "jwt-decode";
import { addTokenPrefix } from "../../utils";
import type { IdTokenableScheme } from "../../types";
import type { Storage } from "../core";
import { TokenStatus } from "./token-status";

export class IdToken {
    scheme: IdTokenableScheme;
    $storage: Storage;

    constructor(scheme: IdTokenableScheme, storage: Storage) {
        this.scheme = scheme;
        this.$storage = storage;
    }

    get(): string | boolean {
        const _key = this.scheme.options.idToken.prefix + this.scheme.name;

        return this.$storage.getUniversal(_key) as string | boolean;
    }

    set(tokenValue: string | boolean): string | boolean {
        const idToken = addTokenPrefix(
            tokenValue,
            this.scheme.options.idToken.type
        );

        this.#setToken(idToken);
        this.#updateExpiration(idToken);

        return idToken;
    }

    sync(): string | boolean {
        const idToken = this.#syncToken();
        this.#syncExpiration();

        return idToken;
    }

    reset() {
        this.#setToken(false);
        this.#setExpiration(false);
    }

    status(): TokenStatus {
        return new TokenStatus(this.get(), this.#getExpiration());
    }

    #getExpiration(): number | false {
        const _key =
            this.scheme.options.idToken.expirationPrefix + this.scheme.name;

        return this.$storage.getUniversal(_key) as number | false;
    }

    #setExpiration(expiration: number | false): number | false {
        const _key =
            this.scheme.options.idToken.expirationPrefix + this.scheme.name;

        return this.$storage.setUniversal(_key, expiration) as number | false;
    }

    #syncExpiration(): number | false {
        const _key =
            this.scheme.options.idToken.expirationPrefix + this.scheme.name;

        return this.$storage.syncUniversal(_key) as number | false;
    }

    #updateExpiration(idToken: string | boolean): number | false | void {
        let idTokenExpiration;
        const _tokenIssuedAtMillis = Date.now();
        const _tokenTTLMillis =
            Number(this.scheme.options.idToken.maxAge) * 1000;
        const _tokenExpiresAtMillis = _tokenTTLMillis
            ? _tokenIssuedAtMillis + _tokenTTLMillis
            : 0;

        try {
            idTokenExpiration =
                jwtDecode<JwtPayload>(idToken + "").exp * 1000 ||
                _tokenExpiresAtMillis;
        } catch (error) {
            // If the token is not jwt, we can't decode and refresh it, use _tokenExpiresAt value
            idTokenExpiration = _tokenExpiresAtMillis;

            if (!(error && error.name === "InvalidTokenError")) {
                throw error;
            }
        }

        // Set token expiration
        return this.#setExpiration(idTokenExpiration || false);
    }

    #setToken(idToken: string | boolean): string | boolean {
        const _key = this.scheme.options.idToken.prefix + this.scheme.name;

        return this.$storage.setUniversal(_key, idToken) as string | boolean;
    }

    #syncToken(): string | boolean {
        const _key = this.scheme.options.idToken.prefix + this.scheme.name;

        return this.$storage.syncUniversal(_key) as string | boolean;
    }

    userInfo() {
        const idToken = this.get();
        if (typeof idToken === "string") {
            return jwtDecode(idToken);
        }
    }
}

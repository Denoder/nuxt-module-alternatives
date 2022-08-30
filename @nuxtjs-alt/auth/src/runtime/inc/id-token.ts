import decode, { JwtPayload } from "jwt-decode";
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
        const key = this.scheme.options.idToken.prefix + this.scheme.name;

        return this.$storage.getUniversal(key) as string | boolean;
    }

    set(tokenValue: string | boolean): string | boolean {
        const idToken = addTokenPrefix(tokenValue, this.scheme.options.idToken.type);

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
        const key = this.scheme.options.idToken.expirationPrefix + this.scheme.name;

        return this.$storage.getUniversal(key) as number | false;
    }

    #setExpiration(expiration: number | false): number | false {
        const key = this.scheme.options.idToken.expirationPrefix + this.scheme.name;

        return this.$storage.setUniversal(key, expiration) as number | false;
    }

    #syncExpiration(): number | false {
        const key =
            this.scheme.options.idToken.expirationPrefix + this.scheme.name;

        return this.$storage.syncUniversal(key) as number | false;
    }

    #updateExpiration(idToken: string | boolean): number | false | void {
        let idTokenExpiration: number;
        const tokenIssuedAtMillis = Date.now();
        const tokenTTLMillis = Number(this.scheme.options.idToken.maxAge) * 1000;
        const tokenExpiresAtMillis = tokenTTLMillis ? tokenIssuedAtMillis + tokenTTLMillis : 0;

        try {
            idTokenExpiration = decode<JwtPayload>(idToken as string).exp * 1000 || tokenExpiresAtMillis;
        } 
        catch (error: any) {
            // If the token is not jwt, we can't decode and refresh it, use tokenExpiresAt value
            idTokenExpiration = tokenExpiresAtMillis;

            if (!(error && error.name === "InvalidTokenError")) {
                throw error;
            }
        }

        // Set token expiration
        return this.#setExpiration(idTokenExpiration || false);
    }

    #setToken(idToken: string | boolean): string | boolean {
        const key = this.scheme.options.idToken.prefix + this.scheme.name;

        return this.$storage.setUniversal(key, idToken) as string | boolean;
    }

    #syncToken(): string | boolean {
        const key = this.scheme.options.idToken.prefix + this.scheme.name;

        return this.$storage.syncUniversal(key) as string | boolean;
    }

    userInfo() {
        const idToken = this.get();
        if (typeof idToken === "string") {
            return decode(idToken);
        }
    }
}

import jwtDecode from "jwt-decode";
import { addTokenPrefix } from "../../utils";
import { TokenStatus } from "./token-status.mjs";
export class IdToken {
  constructor(scheme, storage) {
    this.scheme = scheme;
    this.$storage = storage;
  }
  get() {
    const _key = this.scheme.options.idToken.prefix + this.scheme.name;
    return this.$storage.getUniversal(_key);
  }
  set(tokenValue) {
    const idToken = addTokenPrefix(tokenValue, this.scheme.options.idToken.type);
    this.#setToken(idToken);
    this.#updateExpiration(idToken);
    return idToken;
  }
  sync() {
    const idToken = this.#syncToken();
    this.#syncExpiration();
    return idToken;
  }
  reset() {
    this.#setToken(false);
    this.#setExpiration(false);
  }
  status() {
    return new TokenStatus(this.get(), this.#getExpiration());
  }
  #getExpiration() {
    const _key = this.scheme.options.idToken.expirationPrefix + this.scheme.name;
    return this.$storage.getUniversal(_key);
  }
  #setExpiration(expiration) {
    const _key = this.scheme.options.idToken.expirationPrefix + this.scheme.name;
    return this.$storage.setUniversal(_key, expiration);
  }
  #syncExpiration() {
    const _key = this.scheme.options.idToken.expirationPrefix + this.scheme.name;
    return this.$storage.syncUniversal(_key);
  }
  #updateExpiration(idToken) {
    let idTokenExpiration;
    const _tokenIssuedAtMillis = Date.now();
    const _tokenTTLMillis = Number(this.scheme.options.idToken.maxAge) * 1e3;
    const _tokenExpiresAtMillis = _tokenTTLMillis ? _tokenIssuedAtMillis + _tokenTTLMillis : 0;
    try {
      idTokenExpiration = jwtDecode(idToken + "").exp * 1e3 || _tokenExpiresAtMillis;
    } catch (error) {
      idTokenExpiration = _tokenExpiresAtMillis;
      if (!(error && error.name === "InvalidTokenError")) {
        throw error;
      }
    }
    return this.#setExpiration(idTokenExpiration || false);
  }
  #setToken(idToken) {
    const _key = this.scheme.options.idToken.prefix + this.scheme.name;
    return this.$storage.setUniversal(_key, idToken);
  }
  #syncToken() {
    const _key = this.scheme.options.idToken.prefix + this.scheme.name;
    return this.$storage.syncUniversal(_key);
  }
  userInfo() {
    const idToken = this.get();
    if (typeof idToken === "string") {
      return jwtDecode(idToken);
    }
  }
}

export class RefreshController {
  constructor(scheme) {
    this.scheme = scheme;
    this.#refreshPromise = null;
    this.$auth = scheme.$auth;
  }
  #refreshPromise;
  handleRefresh() {
    if (this.#refreshPromise) {
      return this.#refreshPromise;
    }
    return this.#doRefresh();
  }
  #doRefresh() {
    this.#refreshPromise = new Promise((resolve, reject) => {
      this.scheme.refreshTokens().then((response) => {
        this.#refreshPromise = null;
        resolve(response);
      }).catch((error) => {
        this.#refreshPromise = null;
        reject(error);
      });
    });
    return this.#refreshPromise;
  }
}

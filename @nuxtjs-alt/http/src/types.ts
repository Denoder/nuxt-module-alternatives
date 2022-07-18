import type { FetchError, FetchOptions as Options } from 'ohmyfetch'

type HTTPError = FetchError & {
    response: HTTPErrorResponse
    statusCode?: number
}

type HTTPErrorResponse = Response & {
    text: () => Promise<string>
    json: () => Promise<any>
    data: any
}

type OnErrorHook = (
    error: HTTPError
) => void;

export interface NuxtHttpInstance {
    /**
     * Fetches the `url` with the option `{method: 'get'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise with `Body` method added.
     */
    get(url: Request | URL | string, options?: Options): Promise<any>;

    /**
     * Fetches the `url` with the option `{method: 'post'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise with `Body` method added.
     */
    post(url: Request | URL | string, options?: Options): Promise<any>;

    /**
     * Fetches the `url` with the option `{method: 'put'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise with `Body` method added.
     */
    put(url: Request | URL | string, options?: Options): Promise<any>;

    /**
     * Fetches the `url` with the option `{method: 'patch'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise with `Body` method added.
     */
    patch(url: Request | URL | string, options?: Options): Promise<any>;

    /**
     * Fetches the `url` with the option `{method: 'head'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise with `Body` method added.
     */
    head(url: Request | URL | string, options?: Options): Promise<any>;

    /**
     * Fetches the `url` with the option `{method: 'delete'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise with `Body` method added.
     */
    delete(url: Request | URL | string, options?: Options): Promise<any>;

    /**
     * Fetches the `url` with the option `{method: 'get'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise that resolves to JSON parsed value.
     */
    $get<T = unknown>(url: Request | URL | string, options?: Options): Promise<T>;

    /**
     * Fetches the `url` with the option `{method: 'post'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise that resolves to JSON parsed value.
     */
    $post<T = unknown>(url: Request | URL | string, options?: Options): Promise<T>;

    /**
     * Fetches the `url` with the option `{method: 'put'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise that resolves to JSON parsed value.
     */
    $put<T = unknown>(url: Request | URL | string, options?: Options): Promise<T>;

    /**
     * Fetches the `url` with the option `{method: 'patch'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise that resolves to JSON parsed value.
     */
    $patch<T = unknown>(url: Request | URL | string, options?: Options): Promise<T>;

    /**
     * Fetches the `url` with the option `{method: 'head'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise that resolves to JSON parsed value.
     */
    $head<T = unknown>(url: Request | URL | string, options?: Options): Promise<T>;

    /**
     * Fetches the `url` with the option `{method: 'delete'}`.
     *
     * @param url - `Request` object, `URL` object, or URL string.
     * @returns Promise that resolves to JSON parsed value.
     */
    $delete<T = unknown>(url: Request | URL | string, options?: Options): Promise<T>;

    /**
     * Get the baseURL value.
     * @returns string - the base URL value
     */
    getBaseURL(): string

    /**
     * Set the baseURL for all subsequent requests.
     * @param baseURL - the base URL (e.g. `https://myapi.com/`)
     */
    setBaseURL(baseURL: string): void

    /**
     * Set a header on all subsequent requests.
     * @param name - Header name.
     * @param value - Header value.
     */
    setHeader(name: string, value?: string | false): void

    /**
     * Set `Authorization` header on all subsequent requests.
     * @param name - Header name.
     * @param value - Header value.
     */
    setToken(token: string | false, type?: string): void

    /**
     * Inherit ohmyfetch onRequest
     *
     * This hook enables you to globally modify the requests right before it is sent. It will make no further changes to the request after this. The hook function receives the normalized options as the first argument. You could, for example, modify `options.headers` here.
     */
    onRequest(hook: any): void

    /**
     * Inherit ohmyfetch onResponse
     *
     * This hook enables you to globally read and optionally modify the responses. The return value of the hook function will be used as the response object if it's an instance of [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response).
     */
    onResponse(hook: any): void

    /**
     * Set a hook on `onRequestError` (When request failed)
     *
     * This hook enables you to globally handle request errors.
     */
    onRequestError(hook: OnErrorHook): void

    /**
     * Set a hook on `onResponseError` (When request failed)
     *
     * This hook enables you to globally handle request errors.
     */
    onResponseError(hook: OnErrorHook): void

    /**
     * Set a hook on `onRequestError` and `onResponseError` (When request failed)
     *
     * This hook enables you to globally handle request errors.
     */
    onError(hook: OnErrorHook): void

    /**
     * If you need to create your own ky instance which based on $http defaults, you can use the create(options) method.
     */
    create(options: Partial<Options>): NuxtHttpInstance
}

export interface ModuleOptions {
    baseURL?: string;
    baseUrl?: string;
    browserBaseURL?: string;
    browserBaseUrl?: string;
    host?: string;
    prefix?: string;
    proxyHeaders?: boolean;
    proxyHeadersIgnore?: string[];
    serverTimeout: number,
    clientTimeout: number,
    proxy?: boolean;
    port?: string | number;
    retry?: boolean;
    undici?: boolean;
    useConflict?: boolean;
    https?: boolean;
    headers?: any;
}

declare module '@nuxt/schema' {
    export interface NuxtConfig {
        ['http']?: Partial<ModuleOptions>
    }
    export interface NuxtOptions {
        ['http']?: ModuleOptions
    }
}
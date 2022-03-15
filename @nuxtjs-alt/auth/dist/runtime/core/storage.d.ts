import type { ModuleOptions } from '../../options';
export declare type StorageOptions = ModuleOptions & {
    initialState: {
        user: null;
        loggedIn: boolean;
    };
};
export declare class Storage {
    ctx: any;
    options: StorageOptions;
    store: any;
    state: any;
    private _state;
    private _usePinia;
    constructor(ctx: any, options: StorageOptions);
    setUniversal<V extends unknown>(key: string, value: V): V | void;
    getUniversal(key: string): unknown;
    syncUniversal(key: string, defaultValue?: unknown): unknown;
    removeUniversal(key: string): void;
    _initState(): void;
    setState<V extends unknown>(key: string, value: V): V;
    getState(key: string): unknown;
    watchState(watchKey: string, fn: (value: unknown) => void): () => void;
    removeState(key: string): void;
    setLocalStorage<V extends unknown>(key: string, value: V): V | void;
    getLocalStorage(key: string): unknown;
    removeLocalStorage(key: string): void;
    getCookies(): Record<string, unknown>;
    setCookie<V extends unknown>(key: string, value: V, options?: {
        prefix?: string;
    }): V;
    getCookie(key: string): unknown;
    removeCookie(key: string, options?: {
        prefix?: string;
    }): void;
    getPrefix(): string;
    isLocalStorageEnabled(): boolean;
    isCookiesEnabled(): boolean;
}

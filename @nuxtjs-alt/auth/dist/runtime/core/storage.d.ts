import type { ModuleOptions } from "../../options";
import { NuxtApp } from "#app";
export declare type StorageOptions = ModuleOptions & {
    initialState: {
        user: null;
        loggedIn: boolean;
    };
};
export declare class Storage {
    #private;
    ctx: NuxtApp;
    options: StorageOptions;
    state: any;
    constructor(ctx: NuxtApp, options: StorageOptions);
    setUniversal<V extends unknown>(key: string, value: V): V | void;
    getUniversal(key: string): unknown;
    syncUniversal(key: string, defaultValue?: unknown): unknown;
    removeUniversal(key: string): void;
    getStore(pinia: any): any;
    setState<V extends unknown>(key: string, value: V): V;
    getState(key: string): unknown;
    watchState(watchKey: string, fn: (value: unknown) => void): () => void;
    removeState(key: string): void;
    setLocalStorage<V extends unknown>(key: string, value: V): V | void;
    getLocalStorage(key: string): unknown;
    removeLocalStorage(key: string): void;
    getLocalStoragePrefix(): string;
    isLocalStorageEnabled(): boolean;
    setSessionStorage<V extends unknown>(key: string, value: V): V | void;
    getSessionStorage(key: string): unknown;
    removeSessionStorage(key: string): void;
    getSessionStoragePrefix(): string;
    isSessionStorageEnabled(): boolean;
    getCookies(): Record<string, unknown>;
    setCookie<V extends unknown>(key: string, value: V, options?: {
        prefix?: string;
    }): V;
    getCookie(key: string): unknown;
    removeCookie(key: string, options?: {
        prefix?: string;
    }): void;
    isCookiesEnabled(): boolean;
}

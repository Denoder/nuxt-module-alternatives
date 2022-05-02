import type { NuxtApp } from "#app";
import type { RecursivePartial } from "../types";
import type { RouteLocationNormalized } from "vue-router";
export declare const isUnset: (o: unknown) => boolean;
export declare const isSet: (o: unknown) => boolean;
export declare const isSameURL: (ctx: NuxtApp, a: string, b: string) => boolean;
export declare function isRelativeURL(u: string): boolean;
export declare function parseQuery(queryString: string): Record<string, unknown>;
export declare function encodeQuery(queryObject: {
    [key: string]: string | number | boolean;
}): string;
export declare function routeOption(route: RouteLocationNormalized, key: string, value: string | boolean): boolean;
export declare function getMatchedComponents(route: RouteLocationNormalized, matches?: unknown[]): unknown[];
export declare function normalizePath(path?: string, ctx?: NuxtApp): string;
export declare function encodeValue(val: unknown): string;
export declare function decodeValue(val: unknown): unknown;
/**
 * Get property defined by dot notation in string.
 * Based on  https://github.com/dy/dotprop (MIT)
 *
 * @param  {Object} holder   Target object where to look property up
 * @param  {string} propName Dot notation, like 'this.a.b.c'
 * @return {*}          A property value
 */
export declare function getProp(holder: Record<string, any>, propName: string | false): unknown;
export declare function addTokenPrefix(token: string | boolean, tokenType: string | false): string | boolean;
export declare function removeTokenPrefix(token: string | boolean, tokenType: string | false): string | boolean;
export declare function urlJoin(...args: string[]): string;
export declare function cleanObj<T extends Record<string, unknown>>(obj: T): RecursivePartial<T>;
export declare function randomString(length: any): string;

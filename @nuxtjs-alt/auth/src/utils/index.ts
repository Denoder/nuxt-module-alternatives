import type { NuxtApp } from "#app";
import type { RecursivePartial } from "../types";
import type { RouteLocationNormalized } from "vue-router";

export const isUnset = (o: unknown): boolean =>
    typeof o === "undefined" || o === null;

export const isSet = (o: unknown): boolean => !isUnset(o);

export const isSameURL = (ctx: NuxtApp, a: string, b: string): boolean =>
    normalizePath(a, ctx) === normalizePath(b, ctx);

export function isRelativeURL(u: string): boolean {
    return (
        u &&
        u.length &&
        new RegExp(
            [
                "^\\/([a-zA-Z0-9@\\-%_~.:]",
                "[/a-zA-Z0-9@\\-%_~.:]*)?",
                "([?][^#]*)?(#[^#]*)?$",
            ].join("")
        ).test(u)
    );
}

export function parseQuery(queryString: string): Record<string, unknown> {
    const query = {};
    const pairs = queryString.split("&");
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split("=");
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
    }
    return query;
}

export function encodeQuery(queryObject: {
    [key: string]: string | number | boolean;
}): string {
    return Object.entries(queryObject)
        .filter(([_key, value]) => typeof value !== "undefined")
        .map(
            ([key, value]) =>
                encodeURIComponent(key) +
                (value != null ? "=" + encodeURIComponent(value) : "")
        )
        .join("&");
}

export function routeOption(
    route: RouteLocationNormalized,
    key: string,
    value: string | boolean
): boolean {
    return route.matched.some((m) => m.meta[key] === value);
}

export function getMatchedComponents(
    route: RouteLocationNormalized,
    matches: unknown[] = []
): unknown[] {
    return [].concat(
        ...[],
        ...route.matched.map(function (m, index) {
            return Object.keys(m.components).map(function (key) {
                matches.push(index);
                return m.components[key];
            });
        })
    );
}

export function normalizePath(path: string = "", ctx?: NuxtApp): string {
    // Remove query string
    let result = path.split("?")[0];

    // Remove base path
    if (ctx && ctx.$config.app.baseURL) {
        result = result.replace(ctx.$config.app.baseURL, "/");
    }

    // Remove redundant / from the end of path
    if (result.charAt(result.length - 1) === "/") {
        result = result.slice(0, -1);
    }

    // Remove duplicate slashes
    result = result.replace(/\/+/g, "/");

    return result;
}

export function encodeValue(val: unknown): string {
    if (typeof val === "string") {
        return val;
    }
    return JSON.stringify(val);
}

export function decodeValue(val: unknown): unknown {
    // Try to parse as json
    if (typeof val === "string") {
        try {
            return JSON.parse(val);
        } catch (_) {}
    }

    // Return as is
    return val;
}

/**
 * Get property defined by dot notation in string.
 * Based on  https://github.com/dy/dotprop (MIT)
 *
 * @param  {Object} holder   Target object where to look property up
 * @param  {string} propName Dot notation, like 'this.a.b.c'
 * @return {*}          A property value
 */
export function getProp(
    holder: Record<string, any>,
    propName: string | false
): unknown {
    if (!propName || !holder || typeof holder !== "object") {
        return holder;
    }

    if (propName in holder) {
        return holder[propName];
    }

    const propParts = Array.isArray(propName)
        ? propName
        : (propName + "").split(".");

    let result: unknown = holder;
    while (propParts.length && result) {
        result = result[propParts.shift()];
    }

    return result;
}

// Ie "Bearer " + token
export function addTokenPrefix(
    token: string | boolean,
    tokenType: string | false
): string | boolean {
    if (
        !token ||
        !tokenType ||
        typeof token !== "string" ||
        token.startsWith(tokenType)
    ) {
        return token;
    }

    return tokenType + " " + token;
}

export function removeTokenPrefix(
    token: string | boolean,
    tokenType: string | false
): string | boolean {
    if (!token || !tokenType || typeof token !== "string") {
        return token;
    }

    return token.replace(tokenType + " ", "");
}

export function urlJoin(...args: string[]): string {
    return args
        .join("/")
        .replace(/[/]+/g, "/")
        .replace(/^(.+):\//, "$1://")
        .replace(/^file:/, "file:/")
        .replace(/\/(\?|&|#[^!])/g, "$1")
        .replace(/\?/g, "&")
        .replace("&", "?");
}

export function cleanObj<T extends Record<string, unknown>>(
    obj: T
): RecursivePartial<T> {
    for (const key in obj) {
        if (obj[key] === undefined) {
            delete obj[key];
        }
    }

    return obj as RecursivePartial<T>;
}

const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export function randomString(length) {
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

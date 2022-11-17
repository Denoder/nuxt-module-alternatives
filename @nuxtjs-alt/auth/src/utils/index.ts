import type { RouteComponent } from 'vue-router';
import type { RecursivePartial } from '../types';
import { useRuntimeConfig, useRoute } from '#imports';

export const isUnset = (o: any): boolean => typeof o === 'undefined' || o === null;

export const isSet = (o: any): boolean => !isUnset(o);

export function isRelativeURL(u: string) {
    return (u && u.length && new RegExp(['^\\/([a-zA-Z0-9@\\-%_~.:]', '[/a-zA-Z0-9@\\-%_~.:]*)?', '([?][^#]*)?(#[^#]*)?$'].join('')).test(u));
}

export function routeMeta(key: string, value: string | boolean): boolean {
    return useRoute().meta[key] === value
}

export function getMatchedComponents(matches: unknown[] = []): RouteComponent[][] {
    return [
        ...useRoute().matched.map(function (m, index: number) {
            return Object.keys(m.components!).map(function (key) {
                matches.push(index);
                return m.components![key];
            });
        })
    ]
}

export function normalizePath(path: string = ''): string {
    // Remove query string
    const config = useRuntimeConfig()
    let result = path.split('?')[0];

    // Remove base path
    if (config.app.baseURL) {
        result = result.replace(config.app.baseURL, '/');
    }

    // Remove redundant / from the end of path
    if (result.charAt(result.length - 1) === '/') {
        result = result.slice(0, -1);
    }

    // Remove duplicate slashes
    result = result.replace(/\/+/g, '/');

    return result;
}

export function encodeValue(val: any): string {
    if (typeof val === 'string') {
        return val;
    }
    return JSON.stringify(val);
}

export function decodeValue(val: any): any {
    // Try to parse as json
    if (typeof val === 'string') {
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
 * @param  { Object } holder   Target object where to look property up
 * @param  { string } propName Dot notation, like 'this.a.b.c'
 * @return { * }          A property value
 */
export function getProp(holder: any, propName: string | false): any {
    if (!propName || !holder || typeof holder !== 'object') {
        return holder;
    }

    if (propName in holder) {
        return holder[propName];
    }

    const propParts = Array.isArray(propName) ? propName : (propName as string).split('.');

    let result = holder;
    while (propParts.length && result) {
        result = result[propParts.shift()];
    }

    return result;
}

// Ie 'Bearer ' + token
export function addTokenPrefix(token: string | boolean, tokenType: string | false): string | boolean {
    if (!token || !tokenType || typeof token !== 'string' || token.startsWith(tokenType)) {
        return token;
    }

    return tokenType + ' ' + token;
}

export function removeTokenPrefix(token: string | boolean, tokenType: string | false): string | boolean {
    if (!token || !tokenType || typeof token !== 'string') {
        return token;
    }

    return token.replace(tokenType + ' ', '');
}

export function cleanObj<T extends Record<string, any>>(obj: T): RecursivePartial<T> {
    for (const key in obj) {
        if (obj[key] === undefined) {
            delete obj[key];
        }
    }

    return obj as RecursivePartial<T>;
}

export function randomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}
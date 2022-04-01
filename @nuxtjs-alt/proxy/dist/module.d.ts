import * as _nuxt_schema from '@nuxt/schema';
import { Options, Filter } from 'http-proxy-middleware';

declare type ProxyContext = Filter | Options;
declare type ProxyOptionsObject = {
    [target: string]: Options;
};
declare type ProxyOptionsArray = Array<[ProxyContext, Options?] | Options | string>;
declare type NuxtProxyOptions = ProxyOptionsObject | ProxyOptionsArray;

declare const _default: _nuxt_schema.NuxtModule<Options>;

declare module "#app" {
    interface NuxtConfig {
        proxy?: NuxtProxyOptions;
    }
}

export { _default as default };

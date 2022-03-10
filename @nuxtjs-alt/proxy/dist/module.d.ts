import * as _nuxt_schema from '@nuxt/schema';
import { Options, Filter } from 'http-proxy-middleware';

declare type ProxyContext = Filter | Options;
declare type ProxyOptionsObject = {
    [target: string]: Options;
};
declare type ProxyOptionsArray = Array<[ProxyContext, Options?] | Options | string>;
declare type NuxtProxyOptions = ProxyOptionsObject | ProxyOptionsArray;

declare module "@nuxt/kit" {
    interface NuxtConfig {
        proxy?: NuxtProxyOptions;
    }
}
declare const _default: _nuxt_schema.NuxtModule<Options>;

export { _default as default };

import * as _nuxt_schema from '@nuxt/schema';
import { DownloadOptions, GoogleFonts } from 'google-fonts-helper';

interface ModuleOptions extends Partial<DownloadOptions & GoogleFonts> {
    prefetch?: boolean;
    preconnect?: boolean;
    preload?: boolean;
    useStylesheet?: boolean;
    download?: boolean;
    inject?: boolean;
}
declare const CONFIG_KEY = "googleFonts";
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions>;

declare module "@nuxt/kit" {
    interface NuxtConfig {
        [CONFIG_KEY]?: ModuleOptions;
    }
}

export { ModuleOptions, _default as default };

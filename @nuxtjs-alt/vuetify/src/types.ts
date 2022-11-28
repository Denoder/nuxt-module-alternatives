import * as NuxtSchema from '@nuxt/schema';
import type { VuetifyOptions } from 'vuetify';

interface Options {
    autoImport?: boolean;
    styles?: true | 'none' | 'expose' | 'sass' | {
        configFile: string;
    };
    /** @internal Only for testing */
    stylesTimeout?: number;
}

export interface ModuleOptions {
    vuetifyOptions?: VuetifyOptions
    pluginOptions?: Options
}

declare module '#app' {
    interface NuxtApp {
        $vuetify: VuetifyOptions;
    }
}

declare module '@nuxt/schema' {
    interface NuxtConfig {
        vuetify?: ModuleOptions;
    }
    interface NuxtOptions {
        vuetify?: ModuleOptions
    }
}

declare const NuxtVuetify: NuxtSchema.NuxtModule<ModuleOptions>

export default NuxtVuetify
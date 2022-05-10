import { name, version } from '../package.json'
import { constructURL, merge, isValidURL, parse, download } from './helper'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { DownloadOptions, GoogleFonts } from './shims'

export interface ModuleOptions extends Partial<DownloadOptions & GoogleFonts> {
    prefetch?: boolean;
    preconnect?: boolean;
    preload?: boolean;
    useStylesheet?: boolean;
    download?: boolean;
    inject?: boolean;
}

const CONFIG_KEY = 'googleFonts'

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    async setup(moduleOptions: ModuleOptions, nuxt) {

        const DEFAULTS: ModuleOptions = {
            families: {},
            display: undefined,
            subsets: [],
            text: undefined,
            prefetch: true,
            preconnect: true,
            preload: true,
            useStylesheet: false,
            download: false,
            base64: false,
            inject: true,
            overwriting: false,
            outputDir: nuxt.options.dir.assets,
            stylePath: 'css/fonts.css',
            fontsDir: 'fonts',
            fontsPath: '~/assets/fonts'
        }

        const options: ModuleOptions = {
            ...DEFAULTS,
            ...moduleOptions,
        }

        // merge fonts from valid head link
        // @ts-ignore
        const fontsParsed = (nuxt.options.app.head.link || []).filter(link => isValidURL(link.href)).map(link => parse(link.href))

        if (fontsParsed.length) {
            merge(...fontsParsed)
        }

        // construct google fonts url
        const url = constructURL({
            families: options.families,
            display: options.display,
            subsets: options.subsets,
            text: options.text
        })

        if (!url) {
            console.warn('No provided fonts.')
            return
        }

        // remove fonts
        // @ts-ignore
        nuxt.options.app.head.link = (nuxt.options.app.head.link || []).filter(link => !isValidURL(link.href))

        // download
        if (options.download) {
            /* @ts-ignore */
            const outputDir = nuxt.options.alias[options.outputDir] || options.outputDir
            const resolver = createResolver(outputDir)

            try {
                await download(url, {
                    base64: options.base64,
                    overwriting: options.overwriting,
                    outputDir,
                    stylePath: options.stylePath,
                    fontsDir: options.fontsDir,
                    fontsPath: options.fontsPath
                })

                if (options.inject) {
                    nuxt.options.css.push(resolver.resolve(options.stylePath))
                }

            } catch (e) { /* istanbul ignore next */
                console.error(e)
            }

            return
        }

        // https://developer.mozilla.org/en-US/docs/Web/Performance/dns-prefetch
        if (options.prefetch) {
            // @ts-ignore
            nuxt.options.app.head.link.push({
                hid: 'gf-prefetch',
                rel: 'dns-prefetch',
                href: 'https://fonts.gstatic.com/'
            })
        }

        // https://developer.mozilla.org/en-US/docs/Web/Performance/dns-prefetch#Best_practices
        // connect to domain of font files
        if (options.preconnect) {
            // @ts-ignore
            nuxt.options.app.head.link.push({
                hid: 'gf-preconnect',
                rel: 'preconnect',
                href: 'https://fonts.gstatic.com/',
                crossorigin: ''
            })
        }

        // https://developer.mozilla.org/pt-BR/docs/Web/HTML/Preloading_content
        // optionally increase loading priority
        if (options.preload) {
            // @ts-ignore
            nuxt.options.app.head.link.push({
                hid: 'gf-preload',
                rel: 'preload',
                as: 'style',
                href: url
            })
        }

        // append CSS
        if (options.useStylesheet) {
            // @ts-ignore
            nuxt.options.app.head.link.push({
                hid: 'gf-style',
                rel: 'stylesheet',
                href: url
            })

            return
        }

        // JS to inject CSS
        // @ts-ignore
        nuxt.options.app.head.script = nuxt.options.app.head.script || []
        // @ts-ignore
        nuxt.options.app.head.script.push({
            hid: 'gf-script',
            innerHTML: `(function(){var l=document.createElement('link');l.rel="stylesheet";l.href="${url}";document.querySelector("head").appendChild(l);})();`
        })

        // no-JS fallback
        // @ts-ignore
        nuxt.options.app.head.noscript = nuxt.options.app.head.noscript || []
        // @ts-ignore
        nuxt.options.app.head.noscript.push({
            hid: 'gf-noscript',
            innerHTML: `<link rel="stylesheet" href="${url}">`
        })

        // Disable sanitazions
        // @ts-ignore
        nuxt.options.app.head.__dangerouslyDisableSanitizersByTagID = nuxt.options.app.head.__dangerouslyDisableSanitizersByTagID || {}
        // @ts-ignore
        nuxt.options.app.head.__dangerouslyDisableSanitizersByTagID['gf-script'] = ['innerHTML']
        // @ts-ignore
        nuxt.options.app.head.__dangerouslyDisableSanitizersByTagID['gf-noscript'] = ['innerHTML']
    }
})

declare module "@nuxt/kit" {
    export interface NuxtConfig {
        [CONFIG_KEY]?: ModuleOptions;
    }
}
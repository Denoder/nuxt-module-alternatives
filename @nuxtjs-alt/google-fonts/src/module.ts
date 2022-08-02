import { resolve } from 'pathe'
import { defineNuxtModule, resolvePath } from '@nuxt/kit'
import { constructURL, download, isValidURL, parse, merge, DownloadOptions, GoogleFonts } from 'google-fonts-helper'
import { name, version } from '../package.json'

export interface ModuleOptions extends Partial<DownloadOptions & GoogleFonts> {
    prefetch?: boolean;
    preconnect?: boolean;
    preload?: boolean;
    useStylesheet?: boolean;
    download?: boolean;
    inject?: boolean;
}

const CONFIG_KEY = 'googleFonts'

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: '^3.0.0'
        },
    },
    defaults: {
        families: {},
        display: undefined, // set to 'swap' later if no preload or user value
        subsets: [],
        text: undefined,
        prefetch: true,
        preconnect: true,
        preload: false,
        useStylesheet: false,
        download: true,
        base64: false,
        inject: true,
        overwriting: false,
        outputDir: 'node_modules/.cache/nuxt-google-fonts',
        stylePath: 'css/nuxt-google-fonts.css',
        fontsDir: 'fonts',
        fontsPath: '../fonts'
    },
    async setup(options, nuxt) {
        // If user hasn't set the display value manually and isn't using
        // a preload, set the default display value to 'swap'
        if (options.display === undefined && !options.preload) {
            options.display = 'swap'
        }

        // replace + with space in options.families
        if (options.families) {
            options.families = Object.fromEntries(Object.entries(options.families).map(([key, value]) => [key.replace(/\+/g, ' '), value]))
        }

        const fontsParsed: any = []

        // merge fonts from valid head link
        nuxt.options.app.head.link = nuxt.options.app.head.link || []
        fontsParsed.push(...nuxt.options.app.head.link.filter(link => isValidURL(link.href)).map(link => parse(link.href)))

        // construct google fonts url
        const url = constructURL(merge(options, ...fontsParsed))

        if (!url) {
            console.warn('No provided fonts.')
            return
        }

        // remove fonts
        nuxt.options.app.head.link = nuxt.options.app.head.link || []
        nuxt.options.app.head.link = nuxt.options.app.head.link.filter(link => !isValidURL(link.href))

        // download
        if (options.download) {
            const outputDir = await resolvePath(options.outputDir)

            try {
                const downloader = download(url, {
                    base64: options.base64,
                    overwriting: options.overwriting,
                    outputDir,
                    stylePath: options.stylePath,
                    fontsDir: options.fontsDir,
                    fontsPath: options.fontsPath
                })

                await downloader.execute()

                if (options.inject) {
                    nuxt.options.css.push(resolve(outputDir, options.stylePath))
                }

                // Add the nuxt google fonts directory
                nuxt.options.nitro = nuxt.options.nitro || {}
                nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
                nuxt.options.nitro.publicAssets.push({ dir: outputDir })
            } catch (e) {
                console.error(e)
            }

            return
        }

        nuxt.options.app.head.link = nuxt.options.app.head.link || []
        nuxt.options.app.head.script = nuxt.options.app.head.script || []

        // https://developer.mozilla.org/en-US/docs/Web/Performance/dns-prefetch
        if (options.prefetch) {
            nuxt.options.app.head.link.push({
                rel: 'dns-prefetch',
                href: 'https://fonts.gstatic.com/'
            })
        }

        // https://developer.mozilla.org/en-US/docs/Web/Performance/dns-prefetch#Best_practices
        if (options.preconnect) {
            nuxt.options.app.head.link.push(
                // connect to domain of font files
                { rel: 'preconnect', href: 'https://fonts.gstatic.com/', crossorigin: 'anonymous' },
                // Should also preconnect to origin of Google fonts stylesheet.
                { rel: 'preconnect', href: 'https://fonts.googleapis.com/' }
            )
        }

        // https://developer.mozilla.org/pt-BR/docs/Web/HTML/Preloading_content
        // optionally increase loading priority
        if (options.preload) {
            nuxt.options.app.head.link.push({
                rel: 'preload',
                as: 'style',
                href: url
            })
        }

        // append CSS
        if (options.useStylesheet) {
            nuxt.options.app.head.link.push({
                rel: 'stylesheet',
                href: url
            })

            return
        }

        // JS to inject CSS
        nuxt.options.app.head.script.unshift({
            'data-hid': 'gf-script',
            children: `(function(){
                var h=document.querySelector("head");
                var m=h.querySelector('meta[name="head:count"]');
                if(m){m.setAttribute('content',Number(m.getAttribute('content'))+1);}
                else{m=document.createElement('meta');m.setAttribute('name','head:count');m.setAttribute('content','1');h.append(m);}
                var l=document.createElement('link');l.rel='stylesheet';l.href='${url}';h.appendChild(l);
            })();`
        })

    }
})

declare module "@nuxt/kit" {
    export interface NuxtConfig {
        [CONFIG_KEY]?: ModuleOptions;
    }
}
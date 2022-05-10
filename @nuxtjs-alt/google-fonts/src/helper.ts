import { resolve } from 'path'
import { createURL, QueryObject, resolveURL, withQuery, withHttps } from 'ufo'
import deepmergeImport from 'deepmerge';
import fsExtraImport from 'fs-extra';
import { $fetch } from 'ohmyfetch'
import { Hookable } from 'hookable'
import { isValidDisplay, convertFamiliesObject, convertFamiliesToArray, parseFontsFromCss } from './utils'
import type { GoogleFonts, DownloaderHooks, DownloadOptions, FontInputOutput } from './shims'

const { all } = deepmergeImport;
const { pathExistsSync, outputFile } = fsExtraImport;
const GOOGLE_FONTS_DOMAIN = 'fonts.googleapis.com'

export function constructURL({ families, display, subsets, text }: GoogleFonts = {}): string | false {
    const subset = (Array.isArray(subsets) ? subsets : [subsets]).filter(Boolean)
    const prefix = subset.length > 0 ? 'css' : 'css2'
    const family = convertFamiliesToArray(families ?? {}, prefix.endsWith('2'))

    if (family.length < 1) {
        return false
    }

    const query: QueryObject = {
        family
    }

    if (display && isValidDisplay(display)) {
        query.display = display
    }

    if (subset.length > 0) {
        query.subset = subset.join(',')
    }

    if (text) {
        query.text = text
    }

    return withHttps(withQuery(resolveURL(GOOGLE_FONTS_DOMAIN, prefix), query))
}

export function merge(...fonts: GoogleFonts[]): GoogleFonts {
    return all<GoogleFonts>(fonts)
}

export function isValidURL(url: string): boolean {
    return RegExp(GOOGLE_FONTS_DOMAIN).test(url)
}

export function parse(url: string): GoogleFonts {
    const result: GoogleFonts = {}

    if (!isValidURL(url)) {
        return result
    }

    const { searchParams, pathname } = createURL(url)

    if (!searchParams.has('family')) {
        return result
    }

    const families = convertFamiliesObject(searchParams.getAll('family'), pathname.endsWith('2'))

    if (Object.keys(families).length < 1) {
        return result
    }

    result.families = families

    const display = searchParams.get('display')
    if (display && isValidDisplay(display)) {
        result.display = display
    }

    const subsets = searchParams.get('subset')
    if (subsets) {
        result.subsets = subsets.split(',')
    }

    const text = searchParams.get('text')
    if (text) {
        result.text = text
    }

    return result
}

export function download(url: string, options?: Partial<DownloadOptions>) {
    return new Downloader(url, options)
}

export class Downloader extends Hookable<DownloaderHooks> {
    private config: DownloadOptions

    public constructor(
        private url: string,
        options?: Partial<DownloadOptions>
    ) {
        super()

        this.config = {
            base64: false,
            overwriting: false,
            outputDir: './',
            stylePath: 'fonts.css',
            fontsDir: 'fonts',
            fontsPath: './fonts',
            headers: [['user-agent', [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'AppleWebKit/537.36 (KHTML, like Gecko)',
                'Chrome/98.0.4758.102 Safari/537.36'
            ].join(' ')]],
            ...options
        }
    }

    async execute(): Promise<void> {
        if (!isValidURL(this.url)) {
            throw new Error('Invalid Google Fonts URL')
        }

        const { outputDir, stylePath, overwriting, headers, fontsPath } = this.config
        const cssPath = resolve(outputDir, stylePath)

        if (!overwriting && pathExistsSync(cssPath)) {
            return
        }

        // download css content
        await this.callHook('download-css:before', this.url)
        const cssContent = await $fetch(this.url, { headers })
        const fontsFromCss = parseFontsFromCss(cssContent, fontsPath)
        await this.callHook('download-css:done', this.url, cssContent, fontsFromCss)

        // download fonts from css
        const fonts = (await Promise.all(this.downloadFonts(fontsFromCss)))
            .filter(font => font.inputText)

        // write css
        await this.callHook('write-css:before', cssPath, cssContent, fonts)
        const newContent = await this.writeCss(cssPath, cssContent, fonts)
        await this.callHook('write-css:done', cssPath, newContent, cssContent)
    }

    private downloadFonts(fonts: FontInputOutput[]) {
        const { headers, base64, outputDir, fontsDir } = this.config

        return fonts.map(async (font) => {
            await this.callHook('download-font:before', font)

            const response = await $fetch.raw(font.inputFont, { headers, responseType: 'arrayBuffer' })

            if (!response?._data) {
                return {} as FontInputOutput
            }

            const buffer = Buffer.from(response?._data)

            if (base64) {
                const mime = response.headers.get('content-type') ?? 'font/woff2'

                font.outputText = `url('data:${mime};base64,${buffer.toString('base64')}')`
            } else {
                const fontPath = resolve(outputDir, fontsDir, font.outputFont)

                await outputFile(fontPath, buffer)
            }

            await this.callHook('download-font:done', font)

            return font
        })
    }

    private async writeCss(path: string, content: string, fonts: FontInputOutput[]) {
        for (const font of fonts) {
            content = content.replace(font.inputText, font.outputText)
        }

        await outputFile(path, content)

        return content
    }
}
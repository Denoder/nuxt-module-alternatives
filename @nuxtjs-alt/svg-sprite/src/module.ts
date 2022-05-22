import { join, sep } from 'path'
import fs from 'fs-extra';
import Svg from './svg'
import Watcher from './watcher'
import { defineNuxtModule, createResolver, addPluginTemplate } from '@nuxt/kit'
import { name, version } from '../package.json'
const { mkdirp, writeFile } = fs;

export interface ModuleOptions {
    input: string
    output: string
    defaultSprite: string
    svgoConfig: any
    elementClass: string
    spriteClassPrefix: string
    iconsPath: string
    loaderOptions: any
}

let svgManager

export default defineNuxtModule<ModuleOptions>({
    meta: {
        name,
        version,
        configKey: 'svgSprite'
    },
    defaults: {
        input: '~/assets/sprite/svg',
        output: '~/assets/sprite/gen',
        defaultSprite: 'icons',
        svgoConfig: null,
        elementClass: 'icon',
        spriteClassPrefix: 'sprite-',
        iconsPath: '/_icons',
        loaderOptions: {
            name: '[name].[contenthash:6].[ext]'
        }
    },
    async setup(moduleDefaults, nuxt) {

        const options = {
            ...moduleDefaults,
            ...nuxt.options['svgSprite']
        }

        const resolver = createResolver(import.meta.url)
        const resolve = $path => $path.replace(/\//g, sep).replace('~', nuxt.options.srcDir)

        options._input = options.input
        options._output = options.output
        options.input = resolve(options.input)
        options.output = resolve(options.output)

        nuxt.hook('components:dirs', (dirs) => { 
            dirs.push({
                path: resolver.resolve('runtime/components')
            })
        })

        // Register plugin
        addPluginTemplate({
            src: resolver.resolve('runtime/plugin.mjs'),
            fileName: 'nuxt-svg-sprite.js',
            options
        })

        svgManager = new Svg(options)
        svgManager.hook('svg-sprite:update', (sprites) => {
            options.sprites = Object.keys(sprites)
        })

        if (nuxt.options.dev) {
            nuxt.options.build.watch.push(
                resolver.resolve(join(options.output, 'sprites.json'))
            )

            nuxt.hook('build:done', () => {
                options._filesWatcher = new Watcher(svgManager)
            })

            nuxt.hook('close', () => {
                if (options._filesWatcher) {
                    options._filesWatcher.close()
                }
            })
        }

        await init(options)

        await svgManager.generateSprites()

        // @ts-ignore
        nuxt.hook('storybook:config', ({ stories }) => {
            stories.push('@nuxtjs-alt/svg-sprite/dist/runtime/stories/*.stories.js')
        })

        // alias output dir
        nuxt.options.alias['~svgsprite'] = options.output
        // Transpile and alias runtime
        const runtimeDir = resolver.resolve('runtime')
        nuxt.options.alias['~svg-sprite-runtime'] = runtimeDir
    }
})

async function init(options) {
    // Create input/output folder
    await mkdirp(options.input)

    await mkdirp(options.output)

    // Ignore output folder contents
    await writeFile(join(options.output, '.gitignore'), '*')
}
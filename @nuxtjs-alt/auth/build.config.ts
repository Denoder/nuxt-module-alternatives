import { defineBuildConfig } from "unbuild";
import { existsSync, promises as fsp } from 'fs'
import { pathToFileURL } from 'url'
import { resolve } from 'path'
import type { NuxtModule } from '@nuxt/schema'

export default defineBuildConfig({
    declaration: true,
    entries: [
        'src/module',
        'src/options',
        'src/plugin',
        { input: 'src/runtime/', outDir: 'dist/runtime', ext: 'mjs' },
        { input: 'src/types/', outDir: 'dist/types', ext: 'd.ts' },
        { input: 'src/utils/', outDir: 'dist/utils', ext: 'mjs' },
        { input: 'src/providers/', outDir: 'dist/providers', ext: 'mjs' },
    ],
    rollup: {
        emitCJS: false,
        cjsBridge: true,
    },
    externals: [
        "#app",
        "axios",
        "vue-router",
        "fs-extra",
        "follow-redirects",
        "@pinia/nuxt",
        "pinia",
        // Workspace Modules
        "@nuxtjs-alt/axios",
        "@nuxtjs-alt/pinia",
        // Defaults
        "@nuxt/schema",
        "@nuxt/kit",
        "nuxt",
    ],
    hooks: {
        async 'rollup:done' (ctx) {

            // Generate CommonJS stup
            await writeCJSStub(ctx.options.outDir)
    
            // Load module meta
            const moduleEntryPath = resolve(ctx.options.outDir, 'module.mjs')
            const moduleFn: NuxtModule<any> = await import(
                pathToFileURL(moduleEntryPath).toString()
            ).then(r => r.default || r).catch((err) => {
                console.error(err)
                console.error('Cannot load module. Please check dist:', moduleEntryPath)
                return null
            })
            if (!moduleFn) {
                return
            }
            const moduleMeta = await moduleFn.getMeta()
    
            // Enhance meta using package.json
            if (ctx.pkg) {
                if (!moduleMeta.name) {
                    moduleMeta.name = ctx.pkg.name
                }
                if (!moduleMeta.version) {
                    moduleMeta.version = ctx.pkg.version
                }
            }
    
            // Write meta
            const metaFile = resolve(ctx.options.outDir, 'module.json')
            await fsp.writeFile(metaFile, JSON.stringify(moduleMeta, null, 2), 'utf8')
        }
    }
});

async function writeCJSStub (distDir: string) {
    const cjsStubFile = resolve(distDir, 'module.cjs')
    if (existsSync(cjsStubFile)) {
        return
    }

    const cjsStub =
`module.exports = function(...args) {
    return import('./module.mjs').then(m => m.default.call(this, ...args))
}

const _meta = module.exports.meta = require('./module.json')
module.exports.getMeta = () => Promise.resolve(_meta)`

    await fsp.writeFile(cjsStubFile, cjsStub, 'utf8')
}
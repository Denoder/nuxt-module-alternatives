import { name, version } from '../package.json'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { createMiddlewareFile } from './options'
import fs from 'fs-extra'

const CONFIG_KEY = 'proxy' 

export default defineNuxtModule({
    meta: {
        name,
        version,
        configKey: CONFIG_KEY,
        compatibility: {
            nuxt: '^3.0.0'
        }
    },
    setup(options, nuxt) {
        // addServerMiddleware wont accept a function in build mode for some reason so to circumvent this we create a file for each entry
        // the folder will regenerate the files on every build
        const resolver = createResolver(nuxt.options.srcDir)
        const proxyDirectory = resolver.resolve('server/middleware/@proxy')
        fs.emptyDirSync(proxyDirectory)

        // production mode requires file creation due to proxes being created in-memory if it's not a file
        createMiddlewareFile(options, nuxt)
    }
})

declare module "#app" {
    export interface NuxtConfig {
        proxy?: object
    }
}

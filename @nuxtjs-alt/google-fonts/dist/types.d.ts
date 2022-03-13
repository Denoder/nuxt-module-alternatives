
import { ModuleOptions } from './module'

declare module '@nuxt/schema' {
  interface NuxtConfig { ['googleFonts']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['googleFonts']?: ModuleOptions }
}


export { default } from './module'


import { ModuleOptions } from './module'

declare module '@nuxt/schema' {
  interface NuxtConfig { ['axios']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['axios']?: ModuleOptions }
}


export { default } from './module'

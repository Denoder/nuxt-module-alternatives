import type { Auth } from './core'
import { useNuxtApp } from '#imports'

export const useAuth = (): Auth => useNuxtApp().$auth
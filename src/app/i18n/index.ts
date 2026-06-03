import { computed, readonly, ref, watch } from 'vue'
import { localeMeta, messages, type Locale, type MessageTree } from './locales'

const STORAGE_KEY = 'dms.locale'
const DEFAULT_LOCALE: Locale = 'ru'
const supportedLocales = localeMeta.map((item) => item.code)

type TranslateParams = Record<string, string | number>

const normalizeLocale = (value: string | null | undefined): Locale | null => {
  if (!value) return null

  const normalized = value.toLowerCase().split('-')[0]
  return supportedLocales.includes(normalized as Locale)
    ? (normalized as Locale)
    : null
}

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  const savedLocale = normalizeLocale(window.localStorage.getItem(STORAGE_KEY))
  if (savedLocale) return savedLocale

  return normalizeLocale(window.navigator.language) || DEFAULT_LOCALE
}

const currentLocale = ref<Locale>(getInitialLocale())
export const locale = readonly(currentLocale)

const resolveMessage = (
  tree: MessageTree | undefined,
  path: string
): string | undefined => {
  const value = path.split('.').reduce<string | MessageTree | undefined>(
    (node, segment) => {
      if (!node || typeof node === 'string') return undefined
      return node[segment]
    },
    tree
  )

  return typeof value === 'string' ? value : undefined
}

const interpolate = (message: string, params?: TranslateParams): string => {
  if (!params) return message

  return message.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] === undefined ? `{${key}}` : String(params[key])
  )
}

export const getLocale = () => currentLocale.value

export const getDateLocale = () =>
  localeMeta.find((item) => item.code === currentLocale.value)?.dateLocale || 'ru-RU'

export const translate = (key: string, params?: TranslateParams): string => {
  const translated =
    resolveMessage(messages[currentLocale.value], key) ||
    resolveMessage(messages[DEFAULT_LOCALE], key) ||
    resolveMessage(messages.en, key) ||
    key

  return interpolate(translated, params)
}

export const setLocale = (locale: Locale) => {
  currentLocale.value = locale
}

export const initI18n = () => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = currentLocale.value
  }
}

watch(
  currentLocale,
  (locale) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, locale)
    }

    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  },
  { immediate: true }
)

export function useI18n() {
  return {
    locale,
    localeMeta,
    currentLocaleMeta: computed(
      () => localeMeta.find((item) => item.code === currentLocale.value) || localeMeta[0]
    ),
    setLocale,
    t: translate,
    dateLocale: computed(getDateLocale),
  }
}

export type { Locale }

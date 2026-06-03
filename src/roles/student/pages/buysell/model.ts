import type { BuySellListing } from './api'
import { formatKzt } from '@/app/format/money'
import { getDateLocale, translate } from '@/app/i18n'

const listingAccents = [
  'linear-gradient(135deg, #2563eb, #4f46e5)',
  'linear-gradient(135deg, #f97316, #ea580c)',
  'linear-gradient(135deg, #0f766e, #14b8a6)',
  'linear-gradient(135deg, #db2777, #7c3aed)',
  'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
]

export function formatListingPrice(price: number) {
  return formatKzt(price)
}

export function formatListingDate(value?: string | null) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(getDateLocale(), {
    day: '2-digit',
    month: 'long',
  }).format(date)
}

function translateBuySellOption(group: string, value: string, fallback?: string) {
  const key = `pages.buySell.${group}.${value}`
  const translated = translate(key)

  return translated === key ? (fallback || value) : translated
}

export function getBuySellCategoryLabel(value: string, fallback?: string) {
  return translateBuySellOption('categories', value, fallback)
}

export function getBuySellConditionLabel(value: string, fallback?: string) {
  return translateBuySellOption('conditions', value, fallback)
}

export function getBuySellStatusLabel(value: string, fallback?: string) {
  return translateBuySellOption('listingStatuses', value, fallback)
}

export function getListingCategoryLabel(listing: Pick<BuySellListing, 'category' | 'category_label'>) {
  return getBuySellCategoryLabel(listing.category, listing.category_label)
}

export function getListingConditionLabel(listing: Pick<BuySellListing, 'condition' | 'condition_label'>) {
  return getBuySellConditionLabel(listing.condition, listing.condition_label)
}

export function getListingStatusLabel(listing: Pick<BuySellListing, 'status' | 'status_label'>) {
  return getBuySellStatusLabel(listing.status, listing.status_label)
}

export function getListingAccent(seed: number) {
  return listingAccents[Math.abs(seed) % listingAccents.length]
}

export function getListingCoverStyle(
  listing: Pick<BuySellListing, 'id' | 'cover_image' | 'images'>
) {
  const accent = getListingAccent(listing.id)
  const coverImage = listing.cover_image || listing.images?.[0]

  if (!coverImage) {
    return {
      backgroundImage: accent,
    }
  }

  return {
    backgroundImage: `url(${JSON.stringify(coverImage)}), ${accent}`,
  }
}

export function getListingSellerName(listing: Pick<BuySellListing, 'seller'>) {
  return listing.seller.full_name || listing.seller.name || translate('pages.buySell.defaultSeller')
}

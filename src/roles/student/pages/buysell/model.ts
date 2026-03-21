import type { BuySellListing } from './api'

const listingAccents = [
  'linear-gradient(135deg, #2563eb, #4f46e5)',
  'linear-gradient(135deg, #f97316, #ea580c)',
  'linear-gradient(135deg, #0f766e, #14b8a6)',
  'linear-gradient(135deg, #db2777, #7c3aed)',
  'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
]

export function formatListingPrice(price: number) {
  return `${new Intl.NumberFormat('ru-RU').format(price)} ₸`
}

export function formatListingDate(value?: string | null) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
  }).format(date)
}

export function getListingAccent(seed: number) {
  return listingAccents[Math.abs(seed) % listingAccents.length]
}

export function getListingCoverStyle(listing: Pick<BuySellListing, 'id' | 'cover_image'>) {
  const accent = getListingAccent(listing.id)

  if (!listing.cover_image) {
    return {
      backgroundImage: accent,
    }
  }

  return {
    backgroundImage: `${accent}, url(${listing.cover_image})`,
  }
}

export function getListingSellerName(listing: Pick<BuySellListing, 'seller'>) {
  return listing.seller.full_name || listing.seller.name || 'Студент'
}

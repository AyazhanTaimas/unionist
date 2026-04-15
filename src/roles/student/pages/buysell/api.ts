import { api } from '@/api/instance'

export interface BuySellOption {
  value: string
  label: string
}

export interface BuySellSeller {
  id: number | null
  name: string
  full_name: string
  phone_number?: string | null
  uni_id?: string | null
}

export interface BuySellListing {
  id: number
  title: string
  price: number
  category: string
  category_label: string
  condition: string
  condition_label: string
  status: string
  status_label: string
  description: string
  pickup_location?: string | null
  contact_phone?: string | null
  images: string[]
  image_paths: string[]
  cover_image?: string | null
  created_at?: string | null
  published_at?: string | null
  sold_at?: string | null
  is_owner: boolean
  seller: BuySellSeller
}

interface ApiResponse<T> {
  status_code: number
  message: string
  data: T
}

export interface BuySellMeta {
  categories: BuySellOption[]
  conditions: BuySellOption[]
  statuses: BuySellOption[]
}

function isLocalHost(hostname: string) {
  return ['localhost', '127.0.0.1', '0.0.0.0'].includes(hostname)
}

function normalizePublicAssetUrl(value?: string | null): string | null {
  if (!value) return null
  if (typeof window === 'undefined') return value

  try {
    const url = new URL(value, window.location.origin)

    if (isLocalHost(url.hostname) && !isLocalHost(window.location.hostname)) {
      return `${window.location.origin}${url.pathname}${url.search}${url.hash}`
    }

    return url.toString()
  } catch {
    return value
  }
}

function normalizeListingImages(listing: BuySellListing): BuySellListing {
  const images = (listing.images ?? [])
    .map((image) => normalizePublicAssetUrl(image))
    .filter((image): image is string => Boolean(image))
  const coverImage = normalizePublicAssetUrl(listing.cover_image) ?? images[0] ?? null

  return {
    ...listing,
    images,
    cover_image: coverImage,
  }
}

export async function getBuySellMeta(): Promise<BuySellMeta> {
  const { data } = await api.get<ApiResponse<BuySellMeta>>('/buy-sell/meta')
  return data.data
}

export async function getBuySellListings(params?: {
  search?: string
  category?: string
  limit?: number
  exclude_id?: number
  mine?: boolean
}): Promise<BuySellListing[]> {
  const endpoint = params?.mine ? '/buy-sell/listings/mine' : '/buy-sell/listings'
  const { data } = await api.get<ApiResponse<BuySellListing[]>>(endpoint, {
    params,
  })

  return (data.data ?? []).map(normalizeListingImages)
}

export async function getBuySellListing(id: number): Promise<BuySellListing> {
  const { data } = await api.get<ApiResponse<BuySellListing>>(`/buy-sell/listings/${id}`)
  return normalizeListingImages(data.data)
}

export async function createBuySellListing(formData: FormData): Promise<BuySellListing> {
  const { data } = await api.post<ApiResponse<BuySellListing>>('/buy-sell/listings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return normalizeListingImages(data.data)
}

export async function updateBuySellListing(id: number, formData: FormData): Promise<BuySellListing> {
  formData.append('_method', 'PUT')

  const { data } = await api.post<ApiResponse<BuySellListing>>(
    `/buy-sell/listings/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return normalizeListingImages(data.data)
}

export async function deleteBuySellListing(id: number): Promise<void> {
  await api.delete(`/buy-sell/listings/${id}`)
}

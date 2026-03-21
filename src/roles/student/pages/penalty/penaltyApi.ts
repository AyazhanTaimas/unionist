import { api } from '@/api/instance'

export interface PenaltyItem {
  id: number
  title: string
  date: string
  points: number
  redeemed?: boolean
}

export interface PenaltyDetail {
  id: number
  title: string
  description: string
  date: string
  points: number
  images?: string[]
}

export interface RedeemPenaltyPayload {
  event_type: string
  description: string
  file_path: string
}

interface RawPenaltyRule {
  title?: string | null
}

interface RawPenaltyEvidence {
  file_path?: string | null
  url?: string | null
}

interface RawPenalty {
  id: number
  points: number
  description?: string | null
  created_at?: string | null
  status?: string | null
  rule?: RawPenaltyRule | null
  evidences?: RawPenaltyEvidence[] | null
}

const backendBaseUrl = String(api.defaults.baseURL || '').replace(/\/api\/v1\/?$/, '')

const formatPenaltyDate = (value?: string | null) => {
  if (!value) return 'Дата неизвестна'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Дата неизвестна'

  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const resolveEvidenceUrl = (evidence?: RawPenaltyEvidence | null) => {
  const candidate = evidence?.url || evidence?.file_path
  if (!candidate) return null

  if (/^https?:\/\//i.test(candidate)) return candidate
  if (candidate.startsWith('/')) return `${backendBaseUrl}${candidate}`

  return `${backendBaseUrl}/storage/${candidate}`
}

const resolvePenaltyTitle = (penalty: RawPenalty) =>
  penalty.rule?.title?.trim() || `Штраф #${penalty.id}`

const mapPenaltyItem = (penalty: RawPenalty): PenaltyItem => ({
  id: penalty.id,
  title: resolvePenaltyTitle(penalty),
  date: formatPenaltyDate(penalty.created_at),
  points: Number(penalty.points || 0),
  redeemed: penalty.status !== 'active',
})

const mapPenaltyDetail = (penalty: RawPenalty): PenaltyDetail => ({
  id: penalty.id,
  title: resolvePenaltyTitle(penalty),
  description: penalty.description?.trim() || 'Описание отсутствует',
  date: formatPenaltyDate(penalty.created_at),
  points: Number(penalty.points || 0),
  images: (penalty.evidences || [])
    .map((evidence) => resolveEvidenceUrl(evidence))
    .filter((image): image is string => Boolean(image)),
})

export const getPenalties = async (): Promise<PenaltyItem[]> => {
  const { data } = await api.get('/penalties')
  const penalties = (data?.data ?? data ?? []) as RawPenalty[]

  return penalties.map(mapPenaltyItem)
}

export const getPenaltyById = async (id: number): Promise<PenaltyDetail> => {
  const { data } = await api.get(`/penalties/${id}`)
  return mapPenaltyDetail((data?.data ?? data) as RawPenalty)
}

export const redeemPenalty = async (
  id: number,
  payload: RedeemPenaltyPayload
) => {
  const { data } = await api.post(`/penalties/${id}/redeem`, payload)
  return data
}

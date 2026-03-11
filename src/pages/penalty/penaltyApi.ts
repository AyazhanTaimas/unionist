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

export const getPenalties = async (): Promise<PenaltyItem[]> => {
  const { data } = await api.get('/penalties')

  return data?.data ?? data ?? []
}

export const getPenaltyById = async (id: number): Promise<PenaltyDetail> => {
  const { data } = await api.get(`/penalties/${id}`)
  return data?.data ?? data
}

export const redeemPenalty = async (
  id: number,
  payload: RedeemPenaltyPayload
) => {
  const { data } = await api.post(`/penalties/${id}/redeem`, payload)
  return data
}
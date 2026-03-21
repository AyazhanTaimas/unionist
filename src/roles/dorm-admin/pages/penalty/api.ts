import { api } from '@/api/instance'

interface ApiEnvelope<T> {
  data: T
  message: string
  status_code: number
}

export interface PenaltyPerson {
  id: number
  full_name: string
  email: string
  uni_id: string
  role: string
}

export interface PenaltyRoom {
  room_number: string | null
  label: string
}

export interface PenaltyRule {
  id: number
  code: string
  title: string
  default_points: number
  redeemable: boolean
  creates_financial_charge: boolean
  financial_amount: string | null
}

export interface PenaltyEvidence {
  id: number
  file_path: string
}

export interface PenaltyRedemption {
  id: number
  status: string
  event_type: string
  description: string
  file_path: string | null
  created_at: string | null
  reviewed_at: string | null
  user: PenaltyPerson | null
  reviewer: PenaltyPerson | null
}

export interface ManagedPenalty {
  id: number
  status: string
  points: number
  description: string | null
  created_at: string | null
  updated_at: string | null
  student: PenaltyPerson | null
  created_by: PenaltyPerson | null
  room: PenaltyRoom
  rule: PenaltyRule | null
  evidences: PenaltyEvidence[]
  pending_redemption: PenaltyRedemption | null
  latest_redemption_status: string | null
  redemptions_count: number
  pending_redemptions_count: number
}

export interface PenaltyTarget {
  settlement_id: number
  user: PenaltyPerson | null
  room: PenaltyRoom
}

export interface CreatePenaltyPayload {
  user_id: number
  rule_id: number
  points?: number
  description?: string
  evidences?: string[]
}

export const getManagedPenalties = async (): Promise<ManagedPenalty[]> => {
  const { data } = await api.get<ApiEnvelope<ManagedPenalty[]>>('/penalties/manage')
  return data.data
}

export const getPenaltyRules = async (): Promise<PenaltyRule[]> => {
  const { data } = await api.get<ApiEnvelope<PenaltyRule[]>>('/penalties/rules')
  return data.data
}

export const getPenaltyTargets = async (): Promise<PenaltyTarget[]> => {
  const { data } = await api.get<ApiEnvelope<PenaltyTarget[]>>('/penalties/targets')
  return data.data
}

export const createPenalty = async (
  payload: CreatePenaltyPayload
): Promise<string> => {
  const { data } = await api.post<ApiEnvelope<unknown>>('/penalties', payload)
  return data.message
}

export const cancelPenalty = async (
  id: number,
  description?: string
): Promise<string> => {
  const { data } = await api.post<ApiEnvelope<unknown>>(
    `/penalties/${id}/cancel`,
    description ? { description } : {}
  )

  return data.message
}

export const approvePenaltyRedemption = async (id: number): Promise<string> => {
  const { data } = await api.post<ApiEnvelope<unknown>>(
    `/penalties/redemptions/${id}/approve`
  )

  return data.message
}

export const rejectPenaltyRedemption = async (id: number): Promise<string> => {
  const { data } = await api.post<ApiEnvelope<unknown>>(
    `/penalties/redemptions/${id}/reject`
  )

  return data.message
}

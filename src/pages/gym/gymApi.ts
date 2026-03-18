import { api } from '@/api/instance'

export interface GymPlan {
  id: number
  name: string
  price: number
  total_sessions: number
  duration_days?: number
  description?: string | null
  is_active?: boolean
}

export interface GymMembership {
  id: number
  plan?: GymPlan | null
  total_sessions?: number
  remaining_sessions?: number
  started_at?: string
  expires_at?: string
  status?: string
}

export interface GymMembershipResponse {
  status_code: number
  message: string
  data: {
    has_membership: boolean
    membership?: GymMembership | null
    available_plans?: GymPlan[]
    remaining_sessions?: number
    expires_at?: string
    status?: string
    has_active_visit?: boolean
    active_visit?: {
      id: number
      membership_id: number
      visit_date?: string
      check_in_at?: string | null
      check_out_at?: string | null
      duration_minutes?: number | null
      sessions_used?: number
      status?: string
    } | null
  }
}

export interface GymStatsCalendarEntry {
  date: string
  minutes: number
}

export interface GymStatsResponse {
  status_code: number
  message: string
  data: {
    total_visits: number
    total_minutes: number
    current_streak_weeks: number
    best_streak_weeks: number
    calendar: GymStatsCalendarEntry[]
  }
}

export interface GymPlansResponse {
  status_code?: number
  message?: string
  data?: GymPlan[]
}

export const getGymPlans = async (): Promise<GymPlan[]> => {
  const { data } = await api.get('/gym/plans')
  return data?.data ?? data ?? []
}

export const getGymMembership = async (): Promise<GymMembershipResponse> => {
  const { data } = await api.get('/gym/membership')
  return data
}

export const createGymCheckout = async (planId: number): Promise<string | null> => {
  const { data } = await api.post(`/gym/checkout/${planId}`)

  return (
    data?.checkout_url ||
    data?.url ||
    data?.data?.checkout_url ||
    data?.data?.url ||
    null
  )
}

export const getGymStats = async (): Promise<GymStatsResponse> => {
  const { data } = await api.get('/gym/stats')
  return data
}

export const checkInGym = async () => {
  const { data } = await api.post('/gym/check-in')
  return data
}

export const checkOutGym = async () => {
  const { data } = await api.post('/gym/check-out')
  return data
}

import { api } from '@/api/instance'

export interface GymPlan {
  id: number
  name: string
  price: number
  total_sessions: number
  duration_days?: number
  description?: string | null
}

export interface GymMembershipResponse {
  status_code: number
  message: string
  data: {
    has_membership: boolean
    remaining_sessions?: number
    expires_at?: string
    status?: string
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

export const useGymSession = async () => {
  const { data } = await api.post('/gym/use-session')
  return data
}

import { api } from '@/api/instance'

export interface SettlementStatusResponse {
  status_code: number
  message: string
  data: {
    is_living: boolean
    settlement: {
      id: number
      user_id: number
      room_id: number
      status: string
      start_date?: string | null
      end_date?: string | null
      room?: {
        id: number
        room_number: string
        floor?: {
          id: number
          floor_number: number
          building?: {
            id: number
            address: string
          }
        }
      }
    } | null
  }
}

export async function getHousingStatus(
  userId: number
): Promise<SettlementStatusResponse> {
  const { data } = await api.get(`/showStatus/${userId}`)
  return data
}
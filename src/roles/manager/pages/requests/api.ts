import { api } from '@/api/instance'
import type { ManagerApiResponse, ManagerLiveRequest } from './types'

export const getLiveRequests = async (): Promise<ManagerLiveRequest[]> => {
  const { data } = await api.get<ManagerApiResponse<ManagerLiveRequest[]>>('/requests/live')
  return data.data
}

export const getUserHousingStatus = async (userId: number) => {
  const { data } = await api.get<
    ManagerApiResponse<{
      is_living: boolean
      settlement: unknown | null
    }>
  >(`/showStatus/${userId}`)

  return data.data
}

export const approveLiveRequest = (id: number) =>
  api.post(`/requests/live/${id}/approve`)

export const rejectLiveRequest = (id: number) =>
  api.post(`/requests/live/${id}/reject`)

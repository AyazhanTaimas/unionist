import { api } from '@/api/instance'
import type {
  ManagerApiResponse,
  ManagerChangeRoomRequest,
  ManagerLiveRequest,
  ManagerSettlementStatus,
} from './types'

export const getLiveRequests = async (): Promise<ManagerLiveRequest[]> => {
  const { data } = await api.get<ManagerApiResponse<ManagerLiveRequest[]>>('/requests/live')
  return data.data
}

export const getChangeRoomRequests = async (): Promise<ManagerChangeRoomRequest[]> => {
  const { data } = await api.get<ManagerApiResponse<ManagerChangeRoomRequest[]>>(
    '/requests/change-room'
  )
  return data.data
}

export const getUserHousingStatus = async (
  userId: number
): Promise<ManagerSettlementStatus> => {
  const { data } = await api.get<ManagerApiResponse<ManagerSettlementStatus>>(
    `/showStatus/${userId}`
  )

  return data.data
}

export const approveLiveRequest = (id: number) =>
  api.post(`/requests/live/${id}/approve`)

export const rejectLiveRequest = (id: number) =>
  api.post(`/requests/live/${id}/reject`)

export const approveChangeRoomRequest = (id: number) =>
  api.post(`/requests/change-room/${id}/approve`)

export const rejectChangeRoomRequest = (id: number) =>
  api.post(`/requests/change-room/${id}/reject`)

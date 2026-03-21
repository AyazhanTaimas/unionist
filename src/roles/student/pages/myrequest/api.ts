import { api } from '@/api/instance'
import type {
  StudentApiResponse,
  StudentChangeRoomRequest,
  StudentLiveRequest,
} from './types'

export const getMyLiveRequests = async (): Promise<StudentLiveRequest[]> => {
  const { data } = await api.get<StudentApiResponse<StudentLiveRequest[]>>(
    '/requests/live/my'
  )

  return data.data
}

export const getMyChangeRoomRequests = async (): Promise<StudentChangeRoomRequest[]> => {
  const { data } = await api.get<StudentApiResponse<StudentChangeRoomRequest[]>>(
    '/requests/change-room/my'
  )

  return data.data
}

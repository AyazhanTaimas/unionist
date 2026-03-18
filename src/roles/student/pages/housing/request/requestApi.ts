import api from "@/api/instance"


export interface CreateLiveRequestPayload {
  preferred_room_id: number
}

export interface CreateLiveRequestResponse {
  status_code: number
  message: string
  data?: any
  errors?: Record<string, string[]>
}

export const createLiveRequest = async (
  roomId: number
): Promise<CreateLiveRequestResponse> => {
  const { data } = await api.post<CreateLiveRequestResponse>(
    '/requests/live',
    {
      preferred_room_id: roomId,
    } satisfies CreateLiveRequestPayload
  )

  return data
}
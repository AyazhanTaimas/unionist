import { api } from '@/api/instance'

export async function createChangeRoomRequest(preferredRoomId: number) {
  const { data } = await api.post('/requests/change-room', {
    room_id: preferredRoomId,
  })

  return data
}

import { api } from '@/api/instance'

export async function createChangeRoomRequest(preferredRoomId: number) {
  const { data } = await api.post('/requests/change-room', {
    preferred_room_id: preferredRoomId,
  })

  return data
}
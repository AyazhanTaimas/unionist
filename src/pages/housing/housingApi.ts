import { api } from '@/api/instance'
import type { ApiResponse, Building, Floor, Room } from './types'

// 🏢 Корпуса
export const getBuildings = async (): Promise<Building[]> => {
  const { data } = await api.get<ApiResponse<Building[]>>('/buildings')
  return data.data
}

// 🏢➡️🏢 Этажи конкретного корпуса
export const getFloors = async (buildingId: number): Promise<Floor[]> => {
  const { data } = await api.get<ApiResponse<Floor[]>>(
    `/buildings/${buildingId}/floors`
  )
  return data.data
}

// 🏢➡️🏢➡️🚪 Комнаты конкретного этажа
// Предполагаю что у тебя nested так:
export const getRooms = async (
  floorId: number
): Promise<Room[]> => {
  const { data } = await api.get<ApiResponse<Room[]>>(
    `/floors/${floorId}/rooms`
  )
  return data.data
}
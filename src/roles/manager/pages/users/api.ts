import { api } from '@/api/instance'
import type {
  ManagerApiResponse,
  ManagerUser,
  ManagerUserPayload,
} from './types'

export const getUsers = async (): Promise<ManagerUser[]> => {
  const { data } = await api.get<ManagerApiResponse<ManagerUser[]>>('/users')
  return data.data
}

export const createUser = async (
  payload: ManagerUserPayload
): Promise<ManagerUser> => {
  const { data } = await api.post<ManagerApiResponse<ManagerUser>>('/users', payload)
  return data.data
}

export const updateUser = async (
  id: number,
  payload: ManagerUserPayload
): Promise<ManagerUser> => {
  const { data } = await api.put<ManagerApiResponse<ManagerUser>>(`/users/${id}`, payload)
  return data.data
}

export const deleteUser = (id: number) =>
  api.delete(`/users/${id}`)

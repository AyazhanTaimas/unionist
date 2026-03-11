import { api } from '@/api/instance'
import type { ProfileResponse, User } from '../types'

export const getProfile = async (): Promise<User> => {
  const { data } = await api.get<ProfileResponse>('/me')
  return data.data
}

export const updateProfile = async (payload: {
  name: string
  lastname: string
  middlename: string
  phone_number: string
}) => {
  const { data } = await api.put('/me', payload)
  return data
}

export interface ResetPasswordPayload {
  old_password: string
  new_password: string
  confirm_password: string
}

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const { data } = await api.post('/reset-password', payload)
  return data
}

import { api } from '@/api/instance'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  data: {
    token: {
      access_token: string
      type: string
    }
    user: {
      id: number
      email: string
      name?: string
      role?: string
    }
  }
  message: string
  status_code: number
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post('/login', payload)
  return data
}

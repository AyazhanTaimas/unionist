import { api } from '@/api/instance'

interface ApiEnvelope<T> {
  status_code: number
  message: string
  data: T
}

export interface EmployeeStudent {
  id: number
  role: string
  email: string
  phone_number: string | null
  lastname: string | null
  name: string | null
  middlename: string | null
  uni_id: string | null
  gender: string | null
  discipline_limit: number | null
  created_at: string | null
  updated_at: string | null
}

export const getEmployeeStudents = async (): Promise<EmployeeStudent[]> => {
  const { data } = await api.get<ApiEnvelope<EmployeeStudent[]>>('/users')

  return data.data.filter((user) => user.role === 'student')
}

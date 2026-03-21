export interface ManagerUser {
  id: number
  role: 'admin' | 'student' | 'manager' | 'dorm-admin' | 'employee' | string
  email: string
  phone_number: string
  lastname: string
  name: string
  middlename: string
  uni_id: string
  gender: 'male' | 'female' | string
  discipline_limit: number
  created_at: string
  updated_at: string
}

export interface ManagerApiResponse<T> {
  status_code: number
  message: string
  data: T
}

export interface ManagerUserPayload {
  role: string
  email: string
  password?: string
  phone_number: string
  lastname: string
  name: string
  middlename: string
  uni_id: string
  gender: string
  discipline_limit?: number
}

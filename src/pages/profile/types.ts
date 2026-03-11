export interface User {
  id: number
  name: string
  lastname: string
  middlename: string
  uni_id: string
  gender: string
  discipline_limit: number
  email: string
  phone_number: string
  role: string
  created_at: string
  updated_at: string
  password: string
}

export interface ProfileResponse {
  status_code: number
  message: string
  data: User
}
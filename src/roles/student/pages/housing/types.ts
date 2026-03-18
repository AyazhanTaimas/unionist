export interface Building {
  id: number
  name?: string | null
  address: string
  latitude?: number | null
  longitude?: number | null
  total_floors: number
  created_at: string
  updated_at?: string
}

export interface Floor {
  id: number
  building_id: number
  floor_number: number
  created_at?: string
  updated_at?: string
}

export interface Room {
  id: number
  floor_id: number
  room_number: string
  created_at?: string
  updated_at?: string
}

export interface ApiResponse<T> { 
    status_code: number 
    message: string 
    data: T
}

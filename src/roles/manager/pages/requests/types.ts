export interface ManagerRequestStudent {
  id: number
  lastname: string | null
  name: string | null
  middlename: string | null
  email: string | null
  phone_number: string | null
  uni_id: string | null
  gender: string | null
}

export interface ManagerRequestBuilding {
  id: number
  name: string | null
  address: string | null
}

export interface ManagerRequestFloor {
  id: number
  floor_number: number | null
  building: ManagerRequestBuilding | null
}

export interface ManagerRequestRoom {
  id: number
  room_number: string | null
  capacity: number | null
  floor: ManagerRequestFloor | null
}

export interface ManagerRequestDocument {
  id: number
  type: string
  path: string
}

export interface ManagerLiveRequest {
  id: number
  user_id: number
  preferred_room_id: number | null
  status: 'pending' | 'accepted' | 'rejected' | string
  created_at: string
  updated_at: string
  student: ManagerRequestStudent | null
  preferred_room: ManagerRequestRoom | null
  documents: ManagerRequestDocument[]
}

export interface ManagerDormStudent {
  user_id: number
  warning_count: number | null
  user: ManagerRequestStudent | null
}

export interface ManagerSettlement {
  id: number
  user_id: number
  room_id: number
  status: string
  start_at: string | null
  end_at: string | null
  room: ManagerRequestRoom | null
}

export interface ManagerSettlementStatus {
  is_living: boolean
  settlement: ManagerSettlement | null
}

export interface ManagerChangeRoomRequest {
  id: number
  student_id: number
  room_id: number | null
  status: 'pending' | 'accepted' | 'rejected' | string
  description: string | null
  created_at: string
  updated_at: string
  student: ManagerDormStudent | null
  room: ManagerRequestRoom | null
}

export interface ManagerApiResponse<T> {
  status_code: number
  message: string
  data: T
}

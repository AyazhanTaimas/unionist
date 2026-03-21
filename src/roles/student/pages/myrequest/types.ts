export interface StudentRequestBuilding {
  id: number
  name: string | null
  address: string | null
}

export interface StudentRequestFloor {
  id: number
  floor_number: number | null
  building: StudentRequestBuilding | null
}

export interface StudentRequestRoom {
  id: number
  room_number: string | null
  capacity: number | null
  floor: StudentRequestFloor | null
}

export interface StudentRequestDocument {
  id: number
  type: string
  path: string
}

export interface StudentLiveRequest {
  id: number
  user_id: number
  preferred_room_id: number | null
  status: 'pending' | 'accepted' | 'rejected' | string
  created_at: string
  updated_at: string
  preferred_room: StudentRequestRoom | null
  documents: StudentRequestDocument[]
}

export interface StudentChangeRoomRequest {
  id: number
  student_id: number
  room_id: number | null
  status: 'pending' | 'accepted' | 'rejected' | string
  description: string | null
  created_at: string
  updated_at: string
  room: StudentRequestRoom | null
}

export interface StudentApiResponse<T> {
  status_code: number
  message: string
  data: T
}

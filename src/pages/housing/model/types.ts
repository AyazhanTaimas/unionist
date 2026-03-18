export type View = 'map' | 'floor' | 'room' | 'roommap'

export interface Building {
  id: number
  name?: string | null
  address: string
  latitude?: number | null
  longitude?: number | null
  total_floors?: number
}

export interface Floor {
  id: number
  floor_number: number
}

export interface Room {
  id: number
  room_number: string
}

export interface CurrentResidence {
  building_name: string
  floor_number: number
  room_number: string
}

export type View = 'map' | 'floor' | 'room' | 'roommap'

export interface Building {
  id: number
  address: string
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
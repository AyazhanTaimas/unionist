export interface NewsItem {
  id: number
  title: string
  description: string
  photo: string | null
  created_at: string
  updated_at: string
}

export interface NewsResponse {
  status_code: number
  message: string
  data: NewsItem[]
}

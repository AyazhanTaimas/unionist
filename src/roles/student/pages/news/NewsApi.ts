import { api } from '@/api/instance'
import type { NewsItem, NewsResponse } from '@/roles/student/entities/news/model/types'

export const getNews = async (): Promise<NewsItem[]> => {
  const { data } = await api.get<NewsResponse>('/news')
  return data.data
}

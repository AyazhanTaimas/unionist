import { api } from '@/api/instance'
import type { NewsItem, NewsResponse } from '@/roles/student/entities/news/model/types'

export const getNews = async (): Promise<NewsItem[]> => {
  const { data } = await api.get<NewsResponse>('/news')
  return data.data
}

export const createNews = (data: FormData) =>
  api.post('/news', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateNews = (id: number, data: FormData) => {
  data.append('_method', 'PUT')

  return api.post(`/news/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteNews = (id: number) => {
  const payload = new URLSearchParams()
  payload.append('_method', 'DELETE')

  return api.post(`/news/${id}`, payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

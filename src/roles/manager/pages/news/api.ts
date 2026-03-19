import { api } from '@/api/instance'

export const getNews = () => api.get('/v1/news')

export const createNews = (data: FormData) =>
  api.post('/news', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateNews = (id: number, data: FormData) =>
  api.post(`/news/${id}`, data, { // ⚠️ если у тебя Laravel → иногда POST вместо PUT
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteNews = (id: number) =>
  api.delete(`/news/${id}`)
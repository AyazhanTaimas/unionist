import { api } from '@/api/instance'

interface ApiEnvelope<T> {
  status_code: number
  message: string
  data: T
}

export interface InboxNotificationItem {
  id: string
  title: string
  message: string
  action_url: string | null
  sender_name: string | null
  broadcast_id: number | null
  created_at: string | null
  read_at: string | null
}

export interface InboxNotificationsPayload {
  items: InboxNotificationItem[]
  unread_count: number
}

export interface BroadcastNotificationItem {
  id: number
  title: string
  message: string
  action_url: string | null
  created_at: string | null
  updated_at: string | null
  created_by: number | null
  sender_name: string | null
}

export interface CreateBroadcastNotificationPayload {
  title: string
  message: string
  action_url?: string | null
}

export const getInboxNotifications = async (
  limit = 8
): Promise<InboxNotificationsPayload> => {
  const { data } = await api.get<ApiEnvelope<InboxNotificationsPayload>>(
    '/notifications',
    {
      params: { limit },
    }
  )

  return data.data
}

export const markAllInboxNotificationsRead = async (): Promise<{ unread_count: number }> => {
  const { data } = await api.post<ApiEnvelope<{ unread_count: number }>>(
    '/notifications/read-all'
  )

  return data.data
}

export const markInboxNotificationRead = async (
  id: string
): Promise<InboxNotificationItem> => {
  const { data } = await api.post<ApiEnvelope<InboxNotificationItem>>(
    `/notifications/${id}/read`
  )

  return data.data
}

export const getBroadcastNotifications = async (): Promise<BroadcastNotificationItem[]> => {
  const { data } = await api.get<ApiEnvelope<BroadcastNotificationItem[]>>(
    '/notifications/broadcasts'
  )

  return data.data
}

export const createBroadcastNotification = async (
  payload: CreateBroadcastNotificationPayload
): Promise<BroadcastNotificationItem> => {
  const { data } = await api.post<ApiEnvelope<BroadcastNotificationItem>>(
    '/notifications/broadcasts',
    payload
  )

  return data.data
}

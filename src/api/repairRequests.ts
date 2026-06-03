import { api } from './instance'
import { translate } from '@/app/i18n'

export type RepairRequestCategory =
  | 'plumbing'
  | 'electricity'
  | 'furniture'
  | 'heating'
  | 'other'

export type RepairRequestStatus = 'pending' | 'in_progress' | 'resolved' | string

interface ApiEnvelope<T> {
  data: T
  message: string
  status_code: number
}

export interface RepairRequestUser {
  id: number
  full_name: string
  email: string
  uni_id: string
  role: string
}

export interface RepairRequestBuilding {
  id: number | null
  name: string | null
  address: string | null
}

export interface RepairRequestFloor {
  id: number | null
  floor_number: number | null
  building: RepairRequestBuilding | null
}

export interface RepairRequestRoom {
  id: number | null
  room_number: string | null
  capacity: number | null
  floor: RepairRequestFloor | null
}

export interface RepairRequestAttachment {
  id: number
  file_path: string
  url: string | null
}

export interface RepairRequestItem {
  id: number
  status: RepairRequestStatus
  category: RepairRequestCategory | string
  title: string
  description: string
  employee_comment: string | null
  created_at: string | null
  updated_at: string | null
  started_at: string | null
  resolved_at: string | null
  student: RepairRequestUser | null
  handled_by: RepairRequestUser | null
  room: RepairRequestRoom | null
  attachments: RepairRequestAttachment[]
}

export const REPAIR_REQUEST_CATEGORY_OPTIONS: Array<{
  value: RepairRequestCategory
  labelKey: string
}> = [
  { value: 'plumbing', labelKey: 'repair.categories.plumbing' },
  { value: 'electricity', labelKey: 'repair.categories.electricity' },
  { value: 'furniture', labelKey: 'repair.categories.furniture' },
  { value: 'heating', labelKey: 'repair.categories.heating' },
  { value: 'other', labelKey: 'repair.categories.other' },
]

export const getRepairRequestCategoryLabel = (category: string) => {
  const option = REPAIR_REQUEST_CATEGORY_OPTIONS.find((item) => item.value === category)
  return option ? translate(option.labelKey) : category
}

export const getRepairRequestStatusLabel = (status: RepairRequestStatus) => {
  if (status === 'pending') return translate('repair.statuses.pending')
  if (status === 'in_progress') return translate('repair.statuses.in_progress')
  if (status === 'resolved') return translate('repair.statuses.resolved')
  return status
}

export const resolveRepairRequestAssetUrl = (value: string | null) => {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value

  const baseUrl = String(api.defaults.baseURL || '').replace(/\/api\/v1\/?$/, '')

  if (value.startsWith('/')) {
    return `${baseUrl}${value}`
  }

  return `${baseUrl}/${value}`
}

export const getMyRepairRequests = async (): Promise<RepairRequestItem[]> => {
  const { data } = await api.get<ApiEnvelope<RepairRequestItem[]>>('/repair-requests/my')
  return data.data
}

export const createRepairRequest = async (
  payload: FormData
): Promise<ApiEnvelope<RepairRequestItem>> => {
  const { data } = await api.post<ApiEnvelope<RepairRequestItem>>(
    '/repair-requests',
    payload,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return data
}

export const getManagedRepairRequests = async (): Promise<RepairRequestItem[]> => {
  const { data } = await api.get<ApiEnvelope<RepairRequestItem[]>>('/repair-requests')
  return data.data
}

export const startRepairRequest = async (
  id: number
): Promise<ApiEnvelope<RepairRequestItem>> => {
  const { data } = await api.post<ApiEnvelope<RepairRequestItem>>(
    `/repair-requests/${id}/start`
  )

  return data
}

export const resolveRepairRequest = async (
  id: number,
  employeeComment?: string
): Promise<ApiEnvelope<RepairRequestItem>> => {
  const { data } = await api.post<ApiEnvelope<RepairRequestItem>>(
    `/repair-requests/${id}/resolve`,
    employeeComment ? { employee_comment: employeeComment } : {}
  )

  return data
}

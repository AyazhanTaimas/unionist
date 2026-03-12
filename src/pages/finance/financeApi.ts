import { api } from '@/api/instance'

export interface FinanceCharge {
  id: number
  amount: number
  status: string
  type: string
  period_start?: string | null
  period_end?: string | null
}

export async function getFinanceCharges(): Promise<FinanceCharge[]> {
  const { data } = await api.get('/finance/charges')
  return data?.data ?? data ?? []
}

export async function openCheckout(chargeId: number): Promise<string | null> {
  const { data } = await api.post(`/finance/checkout/${chargeId}`)

  return (
    data?.checkout_url ||
    data?.url ||
    data?.data?.checkout_url ||
    data?.data?.url ||
    null
  )
}

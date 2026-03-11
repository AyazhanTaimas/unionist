import { api } from '@/api/instance'

export async function openCheckout(chargeId: number): Promise<string | null> {
  const { data } = await api.get(`/finance/checkout/${chargeId}`)

  return (
    data?.checkout_url ||
    data?.url ||
    data?.data?.checkout_url ||
    data?.data?.url ||
    null
  )
}
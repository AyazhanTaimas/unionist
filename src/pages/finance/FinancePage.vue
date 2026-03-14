<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getFinanceCharges, openCheckout, type FinanceCharge } from './financeApi'

type ChargeTab = 'payments' | 'penalty'
type ChargeKind = 'housing' | 'penalty' | 'gym' | 'other'
type ChargeStatus = 'paid' | 'unpaid'

interface Charge {
  id: number
  title: string
  subtitle?: string
  amount: number
  due_date?: string
  paid_at?: string | null
  status: ChargeStatus
  kind: ChargeKind
  raw_type: string
}

const activeTab = ref<ChargeTab>('payments')
const loadingId = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const charges = ref<Charge[]>([])

function formatDate(value?: string | null) {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ru-RU')
}

function normalizeKind(type: string): ChargeKind {
  const normalized = type.toLowerCase()

  if (normalized.includes('penalty')) return 'penalty'
  if (normalized.includes('gym')) return 'gym'
  if (normalized.includes('rent') || normalized.includes('settlement') || normalized.includes('housing')) {
    return 'housing'
  }

  return 'other'
}

function normalizeStatus(status: string): ChargeStatus {
  return status === 'paid' || status === 'succeeded' ? 'paid' : 'unpaid'
}

function getChargePresentation(kind: ChargeKind, rawType: string) {
  switch (kind) {
    case 'housing':
      return {
        title: 'Оплата проживания',
        subtitle: 'Начисление за проживание в общежитии',
      }
    case 'gym':
      return {
        title: 'Оплата абонемента в зал',
        subtitle: 'Тренажерный зал',
      }
    case 'penalty':
      return {
        title: 'Штраф',
        subtitle: 'Дисциплинарное начисление',
      }
    default:
      return {
        title: 'Другая оплата',
        subtitle: rawType.replaceAll('_', ' '),
      }
  }
}

function mapCharge(item: FinanceCharge): Charge {
  const kind = normalizeKind(item.type)
  const dueDate = formatDate(item.period_end)
  const presentation = getChargePresentation(kind, item.type)

  return {
    id: item.id,
    title: presentation.title,
    subtitle: presentation.subtitle,
    amount: Number(item.amount),
    due_date: dueDate,
    status: normalizeStatus(item.status),
    kind,
    raw_type: item.type,
  }
}

async function loadCharges() {
  loading.value = true
  error.value = null

  try {
    const response = await getFinanceCharges()
    charges.value = response.map(mapCharge)
  } catch (e) {
    console.error(e)
    error.value = 'Не удалось загрузить начисления'
    charges.value = []
  } finally {
    loading.value = false
  }
}

const paymentCharges = computed(() =>
  charges.value.filter((item) => item.kind !== 'penalty')
)

const penaltyCharges = computed(() =>
  charges.value.filter((item) => item.kind === 'penalty')
)

const currentCharges = computed(() =>
  activeTab.value === 'payments' ? paymentCharges.value : penaltyCharges.value
)

const currentTotal = computed(() =>
  currentCharges.value
    .filter((item) => item.status === 'unpaid')
    .reduce((sum, item) => sum + item.amount, 0)
)

const summaryTitle = computed(() => {
  if (activeTab.value === 'penalty') {
    return `Общая сумма штрафов: ${formatAmount(currentTotal.value)}`
  }

  return `Общая сумма оплат: ${formatAmount(currentTotal.value)}`
})

const summarySubtitle = computed(() => {
  if (activeTab.value === 'penalty') {
    return 'Проверьте неоплаченные штрафы'
  }

  const unpaidKinds = Array.from(
    new Set(
      currentCharges.value
        .filter((item) => item.status === 'unpaid')
        .map((item) => item.kind)
    )
  )

  if (!unpaidKinds.length) {
    return 'Все текущие оплаты закрыты'
  }

  if (unpaidKinds.length === 1 && unpaidKinds[0] === 'gym') {
    return 'Доступна неоплаченная покупка абонемента в зал'
  }

  if (unpaidKinds.length === 1 && unpaidKinds[0] === 'housing') {
    return 'Есть неоплаченные начисления за проживание'
  }

  return 'Есть несколько типов неоплаченных начислений'
})

function formatAmount(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₸'
}

async function handlePay(chargeId: number) {
  try {
    loadingId.value = chargeId

    const checkoutUrl = await openCheckout(chargeId)

    if (!checkoutUrl) {
      alert('Ссылка на оплату не пришла от сервера')
      return
    }

    window.location.href = checkoutUrl
  } catch (error) {
    console.error(error)
    alert('Не удалось открыть страницу оплаты')
  } finally {
    loadingId.value = null
  }
}

async function handlePayAll() {
  const unpaid = currentCharges.value.filter((item) => item.status === 'unpaid')

  if (!unpaid.length) {
    alert('Нет неоплаченных начислений')
    return
  }

  /**
   * Если backend пока умеет только оплату одного charge,
   * то логично оплачивать по одному.
   * Здесь временно открываем первый неоплаченный.
   *
   * Когда появится endpoint массовой оплаты,
   * заменишь эту логику на create batch checkout.
   */
  const firstUnpaid = unpaid[0]
  if (!firstUnpaid) return
  await handlePay(firstUnpaid.id)
}

onMounted(() => {
  loadCharges()
})
</script>

<template>
  <section class="finance-page">
    <div class="finance-card">
      <div class="finance-summary">
        <div>
          <div class="finance-summary__title">{{ summaryTitle }}</div>
          <div class="finance-summary__subtitle">{{ summarySubtitle }}</div>
        </div>

        <button
          class="pay-btn"
          :disabled="currentTotal === 0"
          @click="handlePayAll"
        >
          {{ activeTab === 'penalty' ? 'Оплатить все' : 'Оплатить' }}
        </button>
      </div>

      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'payments' }"
          @click="activeTab = 'payments'"
        >
          Оплаты
        </button>

        <button
          class="tab-btn"
          :class="{ active: activeTab === 'penalty' }"
          @click="activeTab = 'penalty'"
        >
          Штрафы
        </button>
      </div>

      <div class="charges-list">
        <div v-if="loading" class="empty-state">
          Загрузка начислений...
        </div>

        <div v-else-if="error" class="empty-state">
          {{ error }}
        </div>

        <template v-else>
          <div
            v-for="charge in currentCharges"
            :key="charge.id"
            class="charge-row"
            :class="{ paid: charge.status === 'paid' }"
          >
            <div class="charge-main">
              <div class="charge-title">{{ charge.title }}</div>
              <div v-if="charge.subtitle" class="charge-description">
                {{ charge.subtitle }}
              </div>
              <div v-if="charge.status === 'paid' && charge.paid_at" class="charge-paid">
                оплачено: {{ charge.paid_at }}
              </div>
            </div>

            <div class="charge-meta">
              <div class="charge-topline">
                <div v-if="charge.due_date" class="charge-date">
                  {{ charge.due_date }}
                </div>

                <div class="charge-amount">
                  {{ formatAmount(charge.amount) }}
                </div>
              </div>

              <button
                v-if="charge.status === 'unpaid'"
                class="pay-btn small"
                :disabled="loadingId === charge.id"
                @click="handlePay(charge.id)"
              >
                {{ loadingId === charge.id ? 'Загрузка...' : 'Оплатить' }}
              </button>

              <div v-else class="paid-label">оплачено</div>
            </div>
          </div>
        </template>

        <div v-if="!currentCharges.length" class="empty-state">
          Начислений пока нет
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.finance-page {
  padding: 24px;
  margin-top: 80px;
  height: 100%;
}

.finance-card {
  background: #ffffff;
  border: 1px solid #d8dbe8;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 4px 16px rgba(31, 41, 55, 0.06);
}

.finance-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: #f3f8f6;
  border-radius: 18px;
  padding: 18px 20px;
  margin-bottom: 18px;
}

.finance-summary__title {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
  color: #111827;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;;
}

.finance-summary__subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #2e9f52;
    font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;;

}

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 18px;
  border-bottom: 1px solid #ebeef5;
}

.tab-btn {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0 0 10px;
  font-size: 14px;
  color: #374151;
    font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;;

}

.tab-btn.active {
  color: #4f46e5;
  font-weight: 600;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: #4f46e5;
  border-radius: 999px;
}

.charges-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.charge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid #d8dff0;
  border-radius: 999px;
  padding: 22px 32px;
  background: #ffffff;
}

.charge-main {
  min-width: 0;
}

.charge-title {
  font-size: 17px;
  font-weight: 500;
  color: #1f2937;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.charge-description,
.charge-paid {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
}

.charge-meta {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.charge-topline {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 220px;
  justify-content: flex-end;
}

.charge-date,
.charge-amount {
  font-size: 16px;
  color: #64748b;
  white-space: nowrap;
}

.charge-amount {
  color: #111827;
  font-weight: 600;
}

.pay-btn {
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #8b86ec, #7d7ae8);
  color: #ffffff;
  cursor: pointer;
  padding: 12px 32px;
  font-size: 16px;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.pay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pay-btn.small {
  padding: 10px 24px;
  font-size: 14px;
}

.paid-label {
  font-size: 16px;
  color: #44b86d;
  white-space: nowrap;
}

.empty-state {
  padding: 28px;
  text-align: center;
  color: #64748b;
}

@media (max-width: 900px) {
  .charge-row {
    border-radius: 24px;
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
  }

  .charge-meta {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .charge-topline {
    min-width: 0;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>

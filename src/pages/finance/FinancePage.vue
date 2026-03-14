<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getFinanceCharges, openCheckout, type FinanceCharge } from './financeApi'

type ChargeType = 'housing' | 'penalty'
type ChargeStatus = 'paid' | 'unpaid'

interface Charge {
  id: number
  title: string
  description?: string
  amount: number
  due_date?: string
  paid_at?: string | null
  status: ChargeStatus
  type: ChargeType
}

const activeTab = ref<ChargeType>('housing')
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

function normalizeType(type: string): ChargeType {
  return type.includes('penalty') ? 'penalty' : 'housing'
}

function normalizeStatus(status: string): ChargeStatus {
  return status === 'paid' || status === 'succeeded' ? 'paid' : 'unpaid'
}

function mapCharge(item: FinanceCharge): Charge {
  const type = normalizeType(item.type)
  const dueDate = formatDate(item.period_end)

  return {
    id: item.id,
    title: type === 'housing' ? 'Оплата проживания' : 'Штраф',
    amount: Number(item.amount),
    due_date: dueDate,
    status: normalizeStatus(item.status),
    type,
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

const housingCharges = computed(() =>
  charges.value.filter((item) => item.type === 'housing')
)

const penaltyCharges = computed(() =>
  charges.value.filter((item) => item.type === 'penalty')
)

const currentCharges = computed(() =>
  activeTab.value === 'housing' ? housingCharges.value : penaltyCharges.value
)

const currentTotal = computed(() =>
  currentCharges.value
    .filter((item) => item.status === 'unpaid')
    .reduce((sum, item) => sum + item.amount, 0)
)

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
        <div class="accent-line"></div>
      <div class="finance-summary">
        <div>
          <div class="finance-summary__title">
            <template v-if="activeTab === 'housing'">
              Оплата: {{ formatAmount(currentTotal) }} / семестр
            </template>
            <template v-else>
              Общая сумма штрафов: {{ formatAmount(currentTotal) }}
            </template>
          </div>

          <div class="finance-summary__subtitle">
            <template v-if="activeTab === 'housing'">
              оплачено до: 31.12.2025
            </template>
            <template v-else>
              проверьте неоплаченные штрафы
            </template>
          </div>
        </div>

        <button
          class="pay-btn"
          :disabled="currentTotal === 0"
          @click="handlePayAll"
        >
          <template v-if="activeTab === 'housing'">Оплатить</template>
          <template v-else>Оплатить все</template>
        </button>
      </div>

      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'housing' }"
          @click="activeTab = 'housing'"
        >
          Проживание
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
              <div v-if="charge.description" class="charge-description">
                {{ charge.description }}
              </div>
              <div v-if="charge.status === 'paid' && charge.paid_at" class="charge-paid">
                оплачено: {{ charge.paid_at }}
              </div>
            </div>

            <div class="charge-meta">
              <div v-if="charge.due_date" class="charge-date">
                {{ charge.due_date }}
              </div>

              <div v-if="charge.status === 'unpaid'" class="charge-amount">
                {{ formatAmount(charge.amount) }}
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
  margin-top: 50px;
  height: 100%;
}

.finance-card {
  background: #ffffff;
  border: 1px solid #d8dbe8;
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 4px 16px rgba(31, 41, 55, 0.06);
  position: relative;
}

.accent-line {
  position: absolute;
  left: 0px;
  top: 18px;
  bottom: 18px;
  width: 4px;
  border-radius: 10px;
  background: #4d46ff;

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
  border-radius: 2px;
  background: #4f46e5;
}

.charges-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
    font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;;

}

.charge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  min-height: 64px;
  padding: 14px 18px;
  border: 1px solid #d9dde7;
  border-radius: 999px;
  background: #fff;
    font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;;

}

.charge-row.paid {
  background: #fbfdfb;
}

.charge-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.charge-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.charge-description {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.charge-paid {
  margin-top: 4px;
  font-size: 12px;
  color: #2e9f52;
}

.charge-meta {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-shrink: 0;
}

.charge-date {
  font-size: 13px;
  color: #4b5563;
  min-width: 78px;
  text-align: right;
}

.charge-amount {
  font-size: 24px;
  font-weight: 500;
  color: #111827;
  min-width: 110px;
  text-align: right;
}

.pay-btn {
  border: none;
  border-radius: 999px;
  background: #4f46e5;
  color: #ffffff;
  padding: 10px 22px;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s ease;
}

.pay-btn:hover {
  opacity: 0.92;
}

.pay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pay-btn.small {
  padding: 8px 18px;
  min-width: 110px;
}

.paid-label {
  font-size: 13px;
  color: #2e9f52;
  min-width: 90px;
  text-align: right;
}

.empty-state {
  padding: 24px 0;
  text-align: center;
  color: #6b7280;
}

@media (max-width: 900px) {
  .finance-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .finance-summary__title {
    font-size: 22px;
  }

  .charge-row {
    border-radius: 20px;
    align-items: flex-start;
    flex-direction: column;
  }

  .charge-meta {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

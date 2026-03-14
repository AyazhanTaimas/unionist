<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import gymImage from '@/assets/gym2.png'
import {
  getGymMembership,
  getGymPlans,
  createGymCheckout,
  useGymSession,
  type GymPlan,
} from './gymApi'

const loading = ref(true)
const buttonLoading = ref(false)
const useSessionLoading = ref(false)
const error = ref<string | null>(null)

const plans = ref<GymPlan[]>([])
const selectedPlan = ref<GymPlan | null>(null)

const hasMembership = ref(false)
const remainingVisits = ref<number>(0)
const expiresAt = ref<string>('')
const membershipStatus = ref<string>('')

const showSuccessModal = ref(false)
const successMessage = ref('')

const buttonText = computed(() =>
  hasMembership.value ? 'Продлить абонемент' : 'Купить абонемент'
)

const priceText = computed(() => {
  if (!selectedPlan.value?.price) return '10 000 ₸ / месяц'
  return `${new Intl.NumberFormat('ru-RU').format(selectedPlan.value.price)} ₸ / месяц`
})

const sessionsText = computed(() => {
  if (!selectedPlan.value?.total_sessions) return '12 занятий'
  return `${selectedPlan.value.total_sessions} занятий`
})

const formattedExpiresAt = computed(() => {
  if (!expiresAt.value) return ''
  const date = new Date(expiresAt.value)
  if (Number.isNaN(date.getTime())) return expiresAt.value

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
})

function closeSuccessModal() {
  showSuccessModal.value = false
}

async function loadGymPage() {
  loading.value = true
  error.value = null

  try {
    const [plansRes, membershipRes] = await Promise.all([
      getGymPlans(),
      getGymMembership(),
    ])

    plans.value = plansRes ?? []
    selectedPlan.value = plans.value[0] ?? null

    hasMembership.value = !!membershipRes?.data?.has_membership
    remainingVisits.value = membershipRes?.data?.remaining_sessions ?? 0
    expiresAt.value = membershipRes?.data?.expires_at ?? ''
    membershipStatus.value = membershipRes?.data?.status ?? ''
  } catch (e: any) {
    console.error(e)
    error.value = 'Не удалось загрузить данные тренажерного зала'
  } finally {
    loading.value = false
  }
}

async function handleCheckout() {
  if (!selectedPlan.value) {
    alert('План абонемента не найден')
    return
  }

  try {
    buttonLoading.value = true

    const checkoutUrl = await createGymCheckout(selectedPlan.value.id)

    if (!checkoutUrl) {
      alert('Ссылка на оплату не пришла')
      return
    }

    window.location.href = checkoutUrl
  } catch (e: any) {
    console.error(e)
    alert(e?.response?.data?.message || 'Не удалось создать оплату')
  } finally {
    buttonLoading.value = false
  }
}

async function handleUseSession() {
  try {
    useSessionLoading.value = true

    const res = await useGymSession()

    successMessage.value = res?.message || 'Посещение успешно списано'
    showSuccessModal.value = true

    await loadGymPage()
  } catch (e: any) {
    console.error(e)
    alert(e?.response?.data?.message || 'Не удалось списать занятие')
  } finally {
    useSessionLoading.value = false
  }
}

onMounted(() => {
  loadGymPage()
})
</script>

<template>
  <div class="gym-page">
    <div class="gym-card-wrapper">
      <div class="accent-line"></div>

      <div class="gym-card">
        <template v-if="loading">
          <div class="state-box">Загрузка...</div>
        </template>

        <template v-else-if="error">
          <div class="state-box state-box--error">{{ error }}</div>
        </template>

        <template v-else>
          <h1 class="gym-title">Запись в тренажерный зал</h1>

          <p class="gym-description">
            Тренажёрный зал общежития КБТУ — это удобное и доступное пространство
            для поддержания физической формы и здорового образа жизни.
          </p>

          <div class="gym-content">
            <div class="gym-image-block">
              <img :src="gymImage" alt="Тренажерный зал" class="gym-image" />
            </div>

            <div class="gym-info-list">
              <div class="info-pill">
                <div class="info-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/>
                    <path d="M8 3V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M16 3V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M3 10H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M8 14H8.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M12 14H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M16 14H16.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="info-text">
                  <div class="info-title">Время работы: ежедневно</div>
                  <div class="info-subtitle">с 08:00 до 19:00</div>
                </div>
              </div>

              <div class="info-pill">
                <div class="info-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
                    <path d="M12 7V17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M15 9.5C15 8.67 13.66 8 12 8C10.34 8 9 8.67 9 9.5C9 10.33 10.34 11 12 11C13.66 11 15 11.67 15 12.5C15 13.33 13.66 14 12 14C10.34 14 9 13.33 9 12.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="info-text">
                  <div class="info-title">Стоимость:</div>
                  <div class="info-subtitle">{{ priceText }}</div>
                </div>
              </div>

              <div class="info-pill">
                <div class="info-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" stroke-width="1.8"/>
                    <path d="M8 3V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M16 3V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M7 11H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M7 15H12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <circle cx="18" cy="18" r="4" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M18 16.8V18.2L19.1 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="info-text">
                  <div class="info-title">Абонемент: {{ sessionsText }}</div>
                  <div class="info-subtitle">в месяц</div>
                </div>
              </div>

              <div v-if="hasMembership" class="remaining-pill">
                У вас осталось {{ remainingVisits }} занятий
              </div>

              <div v-if="hasMembership && formattedExpiresAt" class="expires-text">
                Действует до {{ formattedExpiresAt }}
              </div>
            </div>
          </div>

          <div class="gym-footer">
            <button
              class="main-btn"
              :disabled="buttonLoading || !selectedPlan"
              @click="handleCheckout"
            >
              {{ buttonLoading ? 'Загрузка...' : buttonText }}
            </button>

            <button
              v-if="hasMembership"
              class="secondary-btn"
              :disabled="useSessionLoading"
              @click="handleUseSession"
            >
              {{ useSessionLoading ? 'Списание...' : 'Использовать занятие' }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <transition name="modal-fade">
      <div
        v-if="showSuccessModal"
        class="modal-overlay"
        @click.self="closeSuccessModal"
      >
        <div class="modal">
          <h3 class="modal-title">Успешно</h3>
          <p class="modal-text">{{ successMessage }}</p>
          <button class="modal-btn" @click="closeSuccessModal">
            Понятно
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.gym-page {
  width: 100%;
  min-height: 100%;
}

.gym-card-wrapper {
  position: relative;
  width: 100%;
  margin-top: 40px;
}

.accent-line {
  position: absolute;
  left: 19px;
  top: 18px;
  bottom: 18px;
  width: 4px;
  border-radius: 10px;
  background: #4d46ff;

}

.gym-card {
  margin-left: 18px;
  background: #ffffff;
  border: 1px solid #d9dde7;
  border-radius: 34px;
  padding: 18px 24px 20px;
  box-shadow: 0 5px 14px rgba(15, 23, 42, 0.1);
  min-height: 430px;
}

.gym-title {
  margin: 0 0 10px;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 700;
  color: #111111;
}

.gym-description {
  margin: 0 0 18px;
  max-width: 760px;
  font-size: 15px;
  line-height: 1.25;
  color: #1f1f1f;
}

.gym-content {
  display: grid;
  grid-template-columns: 1.65fr 0.9fr;
  gap: 16px;
  align-items: start;
}

.gym-image-block {
  width: 100%;
}

.gym-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.gym-info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-pill,
.remaining-pill {
  min-height: 50px;
  border-radius: 999px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.info-pill {
  border: 1px solid #cfcfcf;
  background: #ffffff;
}

.info-icon {
  width: 28px;
  height: 28px;
  color: #111111;
  flex-shrink: 0;
  margin-right: 10px;
}

.info-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.info-text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.info-title,
.info-subtitle {
  font-size: 14px;
  color: #111111;
  font-weight: 600;
}

.remaining-pill {
  justify-content: center;
  border: 1.5px solid #67b85d;
  background: #f7fff5;
  color: #2f4f2f;
  font-size: 14px;
  font-weight: 600;
}

.expires-text {
  text-align: center;
  font-size: 13px;
  color: #64748b;
  margin-top: -4px;
}

.gym-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
  flex-wrap: wrap;
}

.main-btn,
.secondary-btn {
  min-width: 180px;
  height: 34px;
  padding: 0 24px;
  border: none;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s ease;
}

.main-btn {
  background: #4d46ff;
  color: #ffffff;
}

.secondary-btn {
  background: #eceff8;
  color: #111111;
}

.main-btn:hover,
.secondary-btn:hover {
  opacity: 0.92;
}

.main-btn:disabled,
.secondary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.state-box {
  padding: 18px;
  border-radius: 20px;
  background: #f8fafc;
  color: #334155;
}

.state-box--error {
  background: #fff1f2;
  color: #be123c;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.26);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 24px;
  padding: 24px 20px 18px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
}

.modal-title {
  margin: 0 0 10px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #111111;
}

.modal-text {
  margin: 0 0 16px;
  text-align: center;
  font-size: 15px;
  color: #475569;
}

.modal-btn {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 14px;
  background: #4d46ff;
  color: #ffffff;
  font-size: 15px;
  cursor: pointer;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .gym-content {
    grid-template-columns: 1fr;
  }

  .gym-image {
    height: 280px;
  }

  .gym-footer {
    margin-top: 22px;
  }
}

@media (max-width: 700px) {
  .accent-line {
    display: none;
  }

  .gym-card {
    margin-left: 0;
    padding: 18px;
    border-radius: 24px;
  }

  .gym-title {
    font-size: 20px;
  }

  .gym-description {
    font-size: 14px;
  }

  .gym-image {
    height: 220px;
  }

  .info-pill,
  .remaining-pill {
    border-radius: 20px;
    min-height: 56px;
  }
}
</style>

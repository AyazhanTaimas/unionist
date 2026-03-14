<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import gymImage from '@/assets/gym2.png'
import {
  checkInGym,
  checkOutGym,
  createGymCheckout,
  getGymMembership,
  getGymPlans,
  getGymStats,
  type GymPlan,
} from './gymApi'

type CalendarCell = {
  key: string
  dayNumber: number
  isoDate: string
  isCurrentMonth: boolean
  isToday: boolean
  minutes: number
}

const loading = ref(true)
const purchaseLoading = ref(false)
const checkInLoading = ref(false)
const checkOutLoading = ref(false)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)

const plans = ref<GymPlan[]>([])
const selectedPlan = ref<GymPlan | null>(null)

const hasMembership = ref(false)
const membershipStatus = ref('')
const remainingSessions = ref(0)
const expiresAt = ref('')
const hasActiveVisit = ref(false)
const activeVisit = ref<{ check_in_at?: string | null } | null>(null)

const totalVisits = ref(0)
const totalMinutes = ref(0)
const currentStreakWeeks = ref(0)
const bestStreakWeeks = ref(0)
const calendarEntries = ref<Array<{ date: string; minutes: number }>>([])
const displayedMonth = ref(startOfMonth(new Date()))

const priceText = computed(() => {
  if (!selectedPlan.value?.price) return '10 000 ₸'
  return `${new Intl.NumberFormat('ru-RU').format(selectedPlan.value.price)} ₸`
})

const sessionsText = computed(() => {
  if (!selectedPlan.value?.total_sessions) return '12 занятий'
  return `${selectedPlan.value.total_sessions} занятий`
})

const durationText = computed(() => {
  if (!selectedPlan.value?.duration_days) return '30 дней'
  return `${selectedPlan.value.duration_days} дней`
})

const membershipTone = computed(() => {
  switch (membershipStatus.value) {
    case 'active':
      return 'membership-chip membership-chip--active'
    case 'exhausted':
      return 'membership-chip membership-chip--warning'
    case 'cancelled':
      return 'membership-chip membership-chip--muted'
    default:
      return 'membership-chip membership-chip--danger'
  }
})

const membershipLabel = computed(() => {
  switch (membershipStatus.value) {
    case 'active':
      return 'Активен'
    case 'exhausted':
      return 'Лимит исчерпан'
    case 'cancelled':
      return 'Отменен'
    case 'expired':
      return 'Истек'
    default:
      return 'Нет абонемента'
  }
})

const checkoutButtonText = computed(() => {
  if (purchaseLoading.value) return 'Переход к оплате...'
  if (!hasMembership.value) return 'Купить абонемент'
  if (membershipStatus.value === 'expired' || membershipStatus.value === 'cancelled') {
    return 'Оформить новый абонемент'
  }
  if (membershipStatus.value === 'exhausted') {
    return 'Продление пока недоступно'
  }

  return 'Абонемент уже активен'
})

const canPurchase = computed(() => {
  if (!selectedPlan.value) return false

  return (
    !hasMembership.value ||
    membershipStatus.value === 'expired' ||
    membershipStatus.value === 'cancelled'
  )
})

const canCheckIn = computed(() =>
  hasMembership.value &&
  membershipStatus.value === 'active' &&
  !hasActiveVisit.value &&
  !checkInLoading.value
)

const canCheckOut = computed(() =>
  hasActiveVisit.value && !checkOutLoading.value
)

const activeVisitLabel = computed(() => {
  const dateString = activeVisit.value?.check_in_at
  if (!dateString) return 'Тренировка сейчас активна'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Тренировка сейчас активна'

  return `В зале с ${new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)}`
})

const formattedExpiresAt = computed(() => {
  if (!expiresAt.value) return 'Абонемент еще не оформлен'
  const date = new Date(expiresAt.value)
  if (Number.isNaN(date.getTime())) return expiresAt.value

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
})

const totalHoursText = computed(() => formatHoursMinutes(totalMinutes.value))
const averageMinutesText = computed(() => {
  if (!totalVisits.value) return '0 мин / тренировка'
  return `${Math.round(totalMinutes.value / totalVisits.value)} мин / тренировка`
})

const calendarMap = computed(() => {
  return new Map(calendarEntries.value.map((entry) => [entry.date, entry.minutes]))
})

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(displayedMonth.value)
)

const calendarCells = computed<CalendarCell[]>(() => {
  const monthStart = startOfMonth(displayedMonth.value)
  const monthEnd = endOfMonth(displayedMonth.value)
  const leadingDays = (monthStart.getDay() + 6) % 7
  const gridStart = addDays(monthStart, -leadingDays)
  const trailingDays = 41 - ((differenceInDays(monthEnd, gridStart) + 1) - 1)
  const gridEnd = addDays(monthEnd, trailingDays)

  const cells: CalendarCell[] = []
  let cursor = new Date(gridStart)

  while (cursor <= gridEnd) {
    const isoDate = toIsoDate(cursor)

    cells.push({
      key: isoDate,
      dayNumber: cursor.getDate(),
      isoDate,
      isCurrentMonth: cursor.getMonth() === monthStart.getMonth(),
      isToday: isoDate === toIsoDate(new Date()),
      minutes: calendarMap.value.get(isoDate) ?? 0,
    })

    cursor = addDays(cursor, 1)
  }

  return cells
})

async function loadGymPage() {
  loading.value = true
  error.value = null

  try {
    const [plansRes, membershipRes, statsRes] = await Promise.all([
      getGymPlans(),
      getGymMembership(),
      getGymStats(),
    ])

    plans.value = plansRes ?? []
    selectedPlan.value = selectedPlan.value
      ? plans.value.find((plan) => plan.id === selectedPlan.value?.id) ?? plans.value[0] ?? null
      : plans.value[0] ?? null

    hasMembership.value = !!membershipRes?.data?.has_membership
    membershipStatus.value = membershipRes?.data?.status ?? ''
    remainingSessions.value = membershipRes?.data?.remaining_sessions ?? 0
    expiresAt.value = membershipRes?.data?.expires_at ?? ''
    hasActiveVisit.value = !!membershipRes?.data?.has_active_visit
    activeVisit.value = membershipRes?.data?.active_visit ?? null

    totalVisits.value = statsRes?.data?.total_visits ?? 0
    totalMinutes.value = statsRes?.data?.total_minutes ?? 0
    currentStreakWeeks.value = statsRes?.data?.current_streak_weeks ?? 0
    bestStreakWeeks.value = statsRes?.data?.best_streak_weeks ?? 0
    calendarEntries.value = statsRes?.data?.calendar ?? []

    const newestCalendarDate = calendarEntries.value
      .map((entry) => new Date(entry.date))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((left, right) => right.getTime() - left.getTime())[0]

    displayedMonth.value = newestCalendarDate
      ? startOfMonth(newestCalendarDate)
      : startOfMonth(new Date())
  } catch (e: any) {
    console.error(e)
    error.value = 'Не удалось загрузить данные тренажерного зала'
  } finally {
    loading.value = false
  }
}

async function handleCheckout() {
  if (!selectedPlan.value || !canPurchase.value) return

  try {
    purchaseLoading.value = true
    const checkoutUrl = await createGymCheckout(selectedPlan.value.id)

    if (!checkoutUrl) {
      throw new Error('Checkout URL is missing')
    }

    window.location.href = checkoutUrl
  } catch (e: any) {
    console.error(e)
    notice.value = e?.response?.data?.message || 'Не удалось создать оплату'
  } finally {
    purchaseLoading.value = false
  }
}

async function handleCheckIn() {
  try {
    checkInLoading.value = true
    const res = await checkInGym()
    notice.value = res?.message || 'Вы успешно отметили вход в зал'
    await loadGymPage()
  } catch (e: any) {
    console.error(e)
    await loadGymPage()
    notice.value = e?.response?.data?.message || 'Не удалось выполнить check-in'
  } finally {
    checkInLoading.value = false
  }
}

async function handleCheckOut() {
  try {
    checkOutLoading.value = true
    const res = await checkOutGym()
    notice.value = res?.message || 'Тренировка успешно завершена'
    await loadGymPage()
  } catch (e: any) {
    console.error(e)
    await loadGymPage()

    if (!hasActiveVisit.value) {
      notice.value = 'Активная тренировка уже завершена. Данные обновлены.'
      return
    }

    notice.value = e?.response?.data?.message || 'Не удалось выполнить check-out'
  } finally {
    checkOutLoading.value = false
  }
}

function selectPlan(plan: GymPlan) {
  selectedPlan.value = plan
}

function goToPreviousMonth() {
  displayedMonth.value = new Date(
    displayedMonth.value.getFullYear(),
    displayedMonth.value.getMonth() - 1,
    1
  )
}

function goToNextMonth() {
  displayedMonth.value = new Date(
    displayedMonth.value.getFullYear(),
    displayedMonth.value.getMonth() + 1,
    1
  )
}

onMounted(() => {
  loadGymPage()
})

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function differenceInDays(left: Date, right: Date) {
  const dayMs = 24 * 60 * 60 * 1000
  return Math.round((left.getTime() - right.getTime()) / dayMs)
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function formatHoursMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const leftMinutes = minutes % 60

  if (!hours) return `${leftMinutes} мин`
  return `${hours}ч ${leftMinutes.toString().padStart(2, '0')}м`
}
</script>

<template>
  <div class="gym-page">
    <div class="gym-shell">
      <section class="hero-card">
        <div class="hero-copy">
          <div class="hero-badge">Gym access</div>
          <h1>Тренажерный зал</h1>
          <p>
            Управляйте абонементом, отмечайте вход и выход из зала и следите за
            динамикой тренировок в одном месте.
          </p>

          <div class="action-row">
            <button
              class="primary-btn"
              :disabled="purchaseLoading || !canPurchase"
              @click="handleCheckout"
            >
              {{ checkoutButtonText }}
            </button>

            <button
              class="secondary-btn"
              :disabled="!canCheckIn"
              @click="handleCheckIn"
            >
              {{ checkInLoading ? 'Отмечаем вход...' : 'Check-in' }}
            </button>

            <button
              class="ghost-btn"
              :disabled="!canCheckOut"
              @click="handleCheckOut"
            >
              {{ checkOutLoading ? 'Завершаем...' : 'Check-out' }}
            </button>
          </div>

          <p v-if="notice" class="notice-banner">{{ notice }}</p>
          <p v-else-if="error" class="notice-banner notice-banner--error">{{ error }}</p>
        </div>

        <div class="hero-media">
          <img :src="gymImage" alt="Тренажерный зал" class="hero-image" />
        </div>
      </section>

      <div v-if="loading" class="state-card">Загрузка данных...</div>

      <template v-else>
        <section class="content-grid">
          <article class="membership-card">
            <div class="section-kicker">Текущий абонемент</div>

            <div class="membership-head">
              <div>
                <div :class="membershipTone">{{ membershipLabel }}</div>
                <h2>{{ selectedPlan?.name || 'Месячный абонемент' }}</h2>
              </div>
              <div class="membership-price">{{ priceText }}</div>
            </div>

            <div class="membership-stats">
              <div class="stat-box">
                <span>Осталось занятий</span>
                <strong>{{ remainingSessions }}</strong>
              </div>
              <div class="stat-box">
                <span>Длительность</span>
                <strong>{{ durationText }}</strong>
              </div>
              <div class="stat-box">
                <span>Формат</span>
                <strong>{{ sessionsText }}</strong>
              </div>
            </div>

            <div class="membership-meta">
              <div class="meta-row">
                <span>Действует до</span>
                <strong>{{ formattedExpiresAt }}</strong>
              </div>
              <div class="meta-row">
                <span>Текущий визит</span>
                <strong>{{ hasActiveVisit ? activeVisitLabel : 'Нет активной тренировки' }}</strong>
              </div>
            </div>

            <div class="plan-picker">
              <button
                v-for="plan in plans"
                :key="plan.id"
                class="plan-chip"
                :class="{ 'plan-chip--active': selectedPlan?.id === plan.id }"
                @click="selectPlan(plan)"
              >
                {{ plan.name }}
              </button>
            </div>
          </article>

          <div class="side-column">
            <article class="metric-card">
              <div class="section-kicker">Current streak</div>
              <div class="metric-value">{{ currentStreakWeeks }}</div>
              <div class="metric-caption">недель подряд</div>
              <div class="metric-footnote">
                Личный рекорд: {{ bestStreakWeeks }} недель
              </div>
            </article>

            <article class="metric-card">
              <div class="section-kicker">Time in gym</div>
              <div class="metric-value metric-value--wide">{{ totalHoursText }}</div>
              <div class="metric-caption">{{ averageMinutesText }}</div>
            </article>

            <article class="metric-card">
              <div class="section-kicker">Total visits</div>
              <div class="metric-value">{{ totalVisits }}</div>
              <div class="metric-caption">завершенных тренировок</div>
            </article>
          </div>
        </section>

        <section class="calendar-card">
          <div class="calendar-head">
            <div>
              <div class="section-kicker">Календарь активности</div>
              <h3>{{ monthLabel }}</h3>
            </div>

            <div class="calendar-nav">
              <button class="calendar-nav-btn" @click="goToPreviousMonth">‹</button>
              <button class="calendar-nav-btn" @click="goToNextMonth">›</button>
            </div>
          </div>

          <div class="calendar-weekdays">
            <span>Пн</span>
            <span>Вт</span>
            <span>Ср</span>
            <span>Чт</span>
            <span>Пт</span>
            <span>Сб</span>
            <span>Вс</span>
          </div>

          <div class="calendar-grid">
            <div
              v-for="cell in calendarCells"
              :key="cell.key"
              class="calendar-cell"
              :class="{
                'calendar-cell--muted': !cell.isCurrentMonth,
                'calendar-cell--active': cell.minutes > 0,
                'calendar-cell--today': cell.isToday,
              }"
            >
              <span class="calendar-day">{{ cell.dayNumber }}</span>
              <span v-if="cell.minutes" class="calendar-minutes">{{ cell.minutes }}м</span>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.gym-page {
  min-height: 100%;
  font-family: 'Montserrat', sans-serif;
}.gym-card-wrapper {
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
  gap: 24px;
}

.gym-shell {
  display: grid;
  gap: 24px;
}

.hero-card,
.membership-card,
.metric-card,
.calendar-card,
.state-card {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(168, 179, 226, 0.32);
  box-shadow: 0 20px 40px rgba(60, 72, 126, 0.08);
}

.hero-card {
  border-radius: 30px;
  padding: 28px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.9fr);
  gap: 24px;
  background:
    radial-gradient(circle at top left, rgba(77, 70, 255, 0.14), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 247, 255, 0.98));
}

.hero-badge,
.section-kicker {
  color: #7d88aa;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  font-size: 0.78rem;
}

.hero-copy h1 {
  margin: 14px 0 10px;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 0.95;
  color: #121b38;
}

.hero-copy p {
  margin: 0;
  max-width: 640px;
  color: #5e6d90;
  line-height: 1.65;
}

.action-row {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

button {
  border: none;
  border-radius: 16px;
  padding: 14px 18px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.primary-btn {
  background: linear-gradient(135deg, #2d3cff, #4d46ff);
  color: #fff;
}

.secondary-btn {
  background: #0f172a;
  color: #fff;
}

.ghost-btn {
  background: #edf1ff;
  color: #2d3a66;
}

.primary-btn:hover:not(:disabled),
.secondary-btn:hover:not(:disabled),
.ghost-btn:hover:not(:disabled),
.plan-chip:hover,
.calendar-nav-btn:hover {
  transform: translateY(-1px);
}

.notice-banner {
  margin: 18px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(67, 56, 202, 0.08);
  color: #3730a3;
  font-size: 0.95rem;
}

.notice-banner--error {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.hero-media {
  display: flex;
  align-items: stretch;
}

.hero-image {
  width: 100%;
  min-height: 260px;
  border-radius: 24px;
  object-fit: cover;
}

.state-card {
  border-radius: 24px;
  padding: 24px;
  color: #223055;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.85fr);
  gap: 24px;
}

.membership-card {
  border-radius: 28px;
  padding: 24px;
}

.membership-head {
  margin-top: 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.membership-head h2 {
  margin: 12px 0 0;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  color: #0f172a;
}

.membership-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #2d3cff;
}

.membership-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.membership-chip--active {
  background: #e9fff2;
  color: #15803d;
}

.membership-chip--warning {
  background: #fff6df;
  color: #b45309;
}

.membership-chip--danger {
  background: #fff0f0;
  color: #b91c1c;
}

.membership-chip--muted {
  background: #eef2ff;
  color: #475569;
}

.membership-stats {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.stat-box {
  border-radius: 20px;
  padding: 18px;
  background: linear-gradient(180deg, #f6f8ff, #eef2ff);
}

.stat-box span,
.meta-row span {
  display: block;
  color: #7b88a8;
  font-size: 0.88rem;
}

.stat-box strong,
.meta-row strong {
  display: block;
  margin-top: 10px;
  color: #111b38;
  font-size: 1.1rem;
}

.membership-meta {
  margin-top: 18px;
  display: grid;
  gap: 12px;
}

.meta-row {
  border-bottom: 1px solid #e6ebfb;
  padding-bottom: 12px;
}

.plan-picker {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.plan-chip {
  padding: 10px 14px;
  border-radius: 999px;
  background: #f1f5ff;
  color: #30406a;
}

.plan-chip--active {
  background: #2d3cff;
  color: #fff;
}

.side-column {
  display: grid;
  gap: 18px;
}

.metric-card {
  border-radius: 28px;
  padding: 22px;
}

.metric-value {
  margin-top: 16px;
  font-size: clamp(2.8rem, 5vw, 4.2rem);
  line-height: 0.95;
  font-weight: 800;
  color: #0f172a;
  font-style: italic;
}

.metric-value--wide {
  font-size: clamp(2.2rem, 4vw, 3.2rem);
}

.metric-caption {
  margin-top: 10px;
  color: #5e6d90;
}

.metric-footnote {
  margin-top: 14px;
  color: #7b88a8;
  font-size: 0.92rem;
}

.calendar-card {
  border-radius: 30px;
  padding: 24px;
}

.calendar-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.calendar-head h3 {
  margin: 10px 0 0;
  color: #111b38;
  font-size: clamp(1.4rem, 3vw, 2rem);
  text-transform: capitalize;
}

.calendar-nav {
  display: flex;
  gap: 10px;
}

.calendar-nav-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #eef2ff;
  color: #54617f;
  font-size: 1.5rem;
  padding: 0;
}

.calendar-weekdays,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.calendar-weekdays {
  margin-bottom: 12px;
  gap: 10px;
}

.calendar-weekdays span {
  text-align: center;
  color: #9aa6c3;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.calendar-grid {
  gap: 12px;
}

.calendar-cell {
  min-height: 84px;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(180deg, #f8faff, #eef3ff);
  color: #223055;
}

.calendar-cell--muted {
  background: transparent;
  color: #c0c8dc;
}

.calendar-cell--active {
  background: radial-gradient(circle at center, rgba(92, 124, 255, 0.24), rgba(92, 124, 255, 0.08));
  box-shadow: 0 10px 22px rgba(92, 124, 255, 0.12);
}

.calendar-cell--today {
  background: linear-gradient(180deg, #4338ca, #3125c7);
  color: #fff;
}

.calendar-day {
  font-size: 1.25rem;
  font-weight: 700;
}

.calendar-minutes {
  font-size: 0.76rem;
}

@media (max-width: 1024px) {
  .hero-card,
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero-card,
  .membership-card,
  .metric-card,
  .calendar-card {
    padding: 18px;
    border-radius: 22px;
  }

  .action-row {
    flex-direction: column;
  }

  .membership-stats {
    grid-template-columns: 1fr;
  }

  .calendar-grid {
    gap: 8px;
  }

  .calendar-cell {
    min-height: 62px;
    border-radius: 16px;
  }

  .calendar-day {
    font-size: 1rem;
  }

  .calendar-minutes {
    font-size: 0.68rem;
  }
}
</style>

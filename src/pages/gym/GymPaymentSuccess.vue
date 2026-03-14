<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getGymMembership, getGymStats, type GymStatsResponse } from './gymApi'

type CalendarCell = {
  key: string
  dayNumber: number
  isoDate: string
  isCurrentMonth: boolean
  isToday: boolean
  minutes: number
}

const router = useRouter()

const weekdayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const loading = ref(false)
const error = ref<string | null>(null)

const membershipStatus = ref('')
const remainingSessions = ref(0)
const expiresAt = ref('')

const totalVisits = ref(0)
const totalMinutes = ref(0)
const currentStreakWeeks = ref(0)
const bestStreakWeeks = ref(0)
const calendarEntries = ref<Array<{ date: string; minutes: number }>>([])

const displayedMonth = ref(startOfMonth(new Date()))

const calendarMap = computed(() => {
  return new Map(
    calendarEntries.value.map((entry) => [entry.date, entry.minutes])
  )
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

const highlightedWeek = computed(() => {
  const today = new Date()
  const start = startOfWeek(today)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index)
    const isoDate = toIsoDate(date)

    return {
      isoDate,
      label: new Intl.DateTimeFormat('en-US', { weekday: 'narrow' }).format(date),
      active: (calendarMap.value.get(isoDate) ?? 0) > 0,
      isToday: isoDate === toIsoDate(today),
    }
  })
})

const totalHoursLabel = computed(() => formatHoursMinutes(totalMinutes.value))
const averageMinutesLabel = computed(() => {
  if (!totalVisits.value) return '0 мин / тренировка'
  return `${Math.round(totalMinutes.value / totalVisits.value)} мин / тренировка`
})

const workoutCoverage = computed(() => {
  const maxReference = Math.max(totalMinutes.value, 600)
  return Math.min(100, Math.round((totalMinutes.value / maxReference) * 100))
})

const formattedExpiresAt = computed(() => {
  if (!expiresAt.value) return 'Срок пока не определен'

  const date = new Date(expiresAt.value)
  if (Number.isNaN(date.getTime())) return expiresAt.value

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
})

async function loadGymSuccessData() {
  loading.value = true
  error.value = null

  try {
    const [membership, stats] = await Promise.all([
      getGymMembership(),
      getGymStats(),
    ])

    membershipStatus.value = membership?.data?.status ?? ''
    remainingSessions.value = membership?.data?.remaining_sessions ?? 0
    expiresAt.value = membership?.data?.expires_at ?? ''

    applyStats(stats)
  } catch (e: any) {
    console.error(e)
    error.value = 'Не удалось загрузить статистику абонемента'
  } finally {
    loading.value = false
  }
}

function applyStats(stats: GymStatsResponse | null) {
  totalVisits.value = stats?.data?.total_visits ?? 0
  totalMinutes.value = stats?.data?.total_minutes ?? 0
  currentStreakWeeks.value = stats?.data?.current_streak_weeks ?? 0
  bestStreakWeeks.value = stats?.data?.best_streak_weeks ?? 0
  calendarEntries.value = stats?.data?.calendar ?? []

  const newestCalendarDate = calendarEntries.value
    .map((entry) => new Date(entry.date))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0]

  displayedMonth.value = newestCalendarDate
    ? startOfMonth(newestCalendarDate)
    : startOfMonth(new Date())
}

function goHome() {
  router.push('/')
}

function goToGym() {
  router.push('/gym')
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
  loadGymSuccessData()
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

function startOfWeek(date: Date) {
  const dayIndex = (date.getDay() + 6) % 7
  return addDays(new Date(date.getFullYear(), date.getMonth(), date.getDate()), -dayIndex)
}

function formatHoursMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const leftMinutes = minutes % 60

  if (!hours) {
    return `${leftMinutes} мин`
  }

  return `${hours}ч ${leftMinutes.toString().padStart(2, '0')}м`
}
</script>

<template>
  <div class="gym-success-page">
    <div class="gym-success-shell">
      <section class="hero-card">
        <div class="hero-copy">
          <div class="hero-badge">Абонемент активирован</div>
          <h1>Оплата прошла успешно</h1>
          <p>
            Абонемент в зал уже доступен. Можно перейти к посещениям, следить за
            серией тренировок и календарем активности.
          </p>
        </div>

        <div class="streak-card">
          <div class="streak-header">
            <span class="streak-kicker">Current streak</span>
            <span class="streak-flame">●</span>
          </div>

          <div class="streak-value">{{ currentStreakWeeks }} weeks</div>
          <div class="streak-subtitle">
            Personal record:
            <strong>{{ bestStreakWeeks }} weeks</strong>
          </div>

          <div class="week-strip">
            <div
              v-for="day in highlightedWeek"
              :key="day.isoDate"
              class="week-day"
            >
              <span class="week-day-label">{{ day.label }}</span>
              <span
                class="week-day-dot"
                :class="{
                  'week-day-dot--active': day.active,
                  'week-day-dot--today': day.isToday,
                }"
              >
                <svg v-if="day.active" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M7 12.5L10.3 15.8L17 9"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div v-if="loading" class="state-card">Загрузка статистики...</div>
      <div v-else-if="error" class="state-card state-card--error">{{ error }}</div>

      <template v-else>
        <section class="dashboard-grid">
          <article class="calendar-card">
            <div class="calendar-head">
              <div>
                <div class="calendar-kicker">Календарь активности</div>
                <h2>{{ monthLabel }}</h2>
              </div>

              <div class="calendar-nav">
                <button type="button" class="calendar-nav-btn" @click="goToPreviousMonth">
                  ‹
                </button>
                <button type="button" class="calendar-nav-btn" @click="goToNextMonth">
                  ›
                </button>
              </div>
            </div>

            <div class="calendar-weekdays">
              <span v-for="weekday in weekdayLabels" :key="weekday">{{ weekday }}</span>
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
                <span v-if="cell.minutes > 0" class="calendar-minutes">
                  {{ cell.minutes }}м
                </span>
              </div>
            </div>
          </article>

          <div class="stats-column">
            <article class="metric-card">
              <div class="metric-kicker">Total visits</div>
              <div class="metric-value">{{ totalVisits }}</div>
              <div class="metric-footnote">
                Активных посещений в календаре:
                {{ calendarEntries.length }}
              </div>
            </article>

            <article class="metric-card">
              <div class="metric-kicker">Time in gym</div>
              <div class="metric-value metric-value--compact">{{ totalHoursLabel }}</div>
              <div class="metric-footnote">{{ averageMinutesLabel }}</div>
              <div class="progress-line">
                <span :style="{ width: `${workoutCoverage}%` }"></span>
              </div>
            </article>

            <div class="mini-cards">
              <article class="mini-card">
                <div class="mini-card-label">Осталось занятий</div>
                <div class="mini-card-value">{{ remainingSessions }}</div>
              </article>

              <article class="mini-card">
                <div class="mini-card-label">Статус</div>
                <div class="mini-card-value mini-card-value--status">
                  {{ membershipStatus || 'active' }}
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="membership-banner">
          <div>
            <div class="membership-banner-label">Абонемент действует до</div>
            <div class="membership-banner-value">{{ formattedExpiresAt }}</div>
          </div>

          <div class="action-row">
            <button class="primary" @click="goToGym">
              Перейти в тренажерный зал
            </button>
            <button class="secondary" @click="goHome">
              На главную
            </button>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<style scoped>
.gym-success-page {
  min-height: 100vh;
  padding: 32px 20px 44px;
  background:
    radial-gradient(circle at top left, rgba(80, 115, 255, 0.18), transparent 28%),
    radial-gradient(circle at bottom right, rgba(34, 211, 238, 0.14), transparent 25%),
    linear-gradient(180deg, #f6f8ff 0%, #eef3ff 100%);
  font-family: 'Montserrat', sans-serif;
}

.gym-success-shell {
  max-width: 1220px;
  margin: 0 auto;
  display: grid;
  gap: 28px;
}

.hero-card,
.calendar-card,
.metric-card,
.mini-card,
.membership-banner,
.state-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(171, 185, 255, 0.24);
  box-shadow:
    0 18px 48px rgba(76, 92, 168, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
}

.hero-card {
  border-radius: 32px;
  padding: 34px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, 420px);
  gap: 24px;
  align-items: stretch;
}

.hero-copy h1 {
  margin: 14px 0 12px;
  font-size: clamp(2rem, 4vw, 3.6rem);
  line-height: 0.98;
  color: #15213f;
}

.hero-copy p {
  margin: 0;
  max-width: 600px;
  color: #617094;
  line-height: 1.65;
  font-size: 1rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #1e3a8a, #4f46e5);
  color: #fff;
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.streak-card {
  border-radius: 28px;
  padding: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f5f7ff 100%);
  border: 1px solid rgba(124, 136, 255, 0.2);
}

.streak-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.streak-kicker {
  color: #7482ab;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 700;
  font-size: 0.78rem;
}

.streak-flame {
  color: #ff6a3d;
  font-size: 1.1rem;
}

.streak-value {
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  font-weight: 800;
  color: #101935;
  text-transform: uppercase;
  line-height: 0.95;
}

.streak-subtitle {
  margin-top: 10px;
  color: #7b88a8;
  font-size: 1rem;
}

.streak-subtitle strong {
  color: #4338ca;
}

.week-strip {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.week-day {
  display: grid;
  justify-items: center;
  gap: 10px;
}

.week-day-label {
  font-size: 0.8rem;
  color: #b2b9cf;
  font-weight: 700;
}

.week-day-dot {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid rgba(186, 195, 228, 0.55);
  color: transparent;
  background: rgba(248, 250, 255, 0.9);
}

.week-day-dot svg {
  width: 20px;
  height: 20px;
}

.week-day-dot--active {
  background: linear-gradient(180deg, #4c39ff, #3421d8);
  color: #fff;
  box-shadow: 0 12px 24px rgba(67, 56, 202, 0.28);
}

.week-day-dot--today {
  border-color: #6c63ff;
  box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.1);
}

.state-card {
  border-radius: 28px;
  padding: 32px;
  color: #223055;
  font-size: 1rem;
}

.state-card--error {
  color: #b42318;
  border-color: rgba(244, 114, 114, 0.32);
  background: rgba(255, 245, 245, 0.94);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.8fr);
  gap: 28px;
}

.calendar-card {
  border-radius: 34px;
  padding: 28px;
}

.calendar-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
}

.calendar-kicker,
.metric-kicker,
.membership-banner-label,
.mini-card-label {
  color: #7f8db0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.78rem;
  font-weight: 700;
}

.calendar-head h2 {
  margin: 10px 0 0;
  font-size: clamp(1.6rem, 3vw, 2.3rem);
  color: #15213f;
  text-transform: capitalize;
}

.calendar-nav {
  display: flex;
  gap: 10px;
}

.calendar-nav-btn {
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 16px;
  background: #eef3ff;
  color: #7685aa;
  font-size: 1.6rem;
  cursor: pointer;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.calendar-weekdays span {
  text-align: center;
  color: #a3aec9;
  font-weight: 700;
  letter-spacing: 0.1em;
  font-size: 0.82rem;
  text-transform: uppercase;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 14px;
}

.calendar-cell {
  aspect-ratio: 1 / 1;
  min-height: 86px;
  border-radius: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(180deg, rgba(246, 248, 255, 0.95), rgba(240, 243, 255, 0.72));
  color: #253250;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.calendar-cell--muted {
  color: #c3cbe0;
  background: transparent;
}

.calendar-cell--active {
  background: radial-gradient(circle at center, rgba(123, 97, 255, 0.26), rgba(123, 97, 255, 0.08));
  box-shadow: 0 12px 24px rgba(133, 113, 255, 0.14);
}

.calendar-cell--today {
  background: linear-gradient(180deg, #4338ca, #3125c7);
  color: #fff;
  box-shadow: 0 18px 34px rgba(67, 56, 202, 0.28);
}

.calendar-day {
  font-size: 1.45rem;
  font-weight: 700;
}

.calendar-minutes {
  font-size: 0.78rem;
  opacity: 0.88;
}

.stats-column {
  display: grid;
  gap: 22px;
}

.metric-card {
  border-radius: 30px;
  padding: 24px 26px;
}

.metric-value {
  margin-top: 14px;
  color: #111a38;
  font-size: clamp(3rem, 5vw, 4.6rem);
  line-height: 0.95;
  font-weight: 800;
  font-style: italic;
}

.metric-value--compact {
  font-size: clamp(2.3rem, 4vw, 3.6rem);
}

.metric-footnote {
  margin-top: 12px;
  color: #8794b5;
  font-size: 1rem;
}

.progress-line {
  margin-top: 20px;
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #e8ecf9;
  overflow: hidden;
}

.progress-line span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #3b28ff, #5c7cff);
}

.mini-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.mini-card {
  border-radius: 26px;
  padding: 22px;
  background: linear-gradient(180deg, rgba(234, 237, 255, 0.9), rgba(244, 246, 255, 0.85));
}

.mini-card-value {
  margin-top: 14px;
  color: #182442;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
}

.mini-card-value--status {
  font-size: 1.4rem;
  text-transform: capitalize;
}

.membership-banner {
  border-radius: 30px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.membership-banner-value {
  margin-top: 8px;
  color: #13203e;
  font-size: clamp(1.2rem, 3vw, 2rem);
  font-weight: 700;
}

.action-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

button {
  padding: 14px 18px;
  border-radius: 14px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.primary {
  background: linear-gradient(135deg, #2f3dff, #4669ff);
  color: white;
}

.primary:hover,
.calendar-nav-btn:hover {
  transform: translateY(-1px);
}

.secondary {
  background: #eef2ff;
  color: #34446d;
}

.secondary:hover {
  background: #e2e8ff;
}

@media (max-width: 980px) {
  .hero-card,
  .dashboard-grid,
  .membership-banner {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }

  .action-row {
    width: 100%;
  }

  .action-row button {
    flex: 1 1 220px;
  }
}

@media (max-width: 720px) {
  .gym-success-page {
    padding: 18px 14px 32px;
  }

  .hero-card,
  .calendar-card,
  .metric-card,
  .membership-banner,
  .state-card {
    padding: 20px;
    border-radius: 24px;
  }

  .streak-card,
  .mini-card {
    border-radius: 22px;
  }

  .week-day-dot {
    width: 40px;
    height: 40px;
  }

  .calendar-grid {
    gap: 10px;
  }

  .calendar-cell {
    min-height: 64px;
    border-radius: 18px;
  }

  .calendar-day {
    font-size: 1.05rem;
  }

  .calendar-minutes {
    font-size: 0.68rem;
  }

  .mini-cards {
    grid-template-columns: 1fr;
  }
}
</style>

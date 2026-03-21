<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api/instance'
import { getMyChangeRoomRequests, getMyLiveRequests } from './api'
import type {
  StudentChangeRoomRequest,
  StudentLiveRequest,
  StudentRequestDocument,
  StudentRequestRoom,
} from './types'

type StudentRequestType = 'live' | 'change_room'
type StudentRequestTab = 'all' | 'pending' | 'history'

interface StudentRequestItem {
  key: string
  requestId: number
  type: StudentRequestType
  status: 'pending' | 'accepted' | 'rejected' | string
  createdAt: string
  updatedAt: string
  room: StudentRequestRoom | null
  documents: StudentRequestDocument[]
  description: string | null
}

const liveRequests = ref<StudentLiveRequest[]>([])
const changeRoomRequests = ref<StudentChangeRoomRequest[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref<StudentRequestTab>('all')

const baseUrl = String(api.defaults.baseURL || '').replace(/\/api\/v1\/?$/, '')

const allRequests = computed<StudentRequestItem[]>(() => {
  const live = liveRequests.value.map((item) => ({
    key: `live-${item.id}`,
    requestId: item.id,
    type: 'live' as const,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    room: item.preferred_room,
    documents: item.documents || [],
    description: null,
  }))

  const changeRoom = changeRoomRequests.value.map((item) => ({
    key: `change-room-${item.id}`,
    requestId: item.id,
    type: 'change_room' as const,
    status: item.status,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    room: item.room,
    documents: [],
    description: item.description,
  }))

  return [...live, ...changeRoom].sort((left, right) => {
    if (left.status === 'pending' && right.status !== 'pending') return -1
    if (left.status !== 'pending' && right.status === 'pending') return 1

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  })
})

const totalCount = computed(() => allRequests.value.length)
const pendingCount = computed(
  () => allRequests.value.filter((item) => item.status === 'pending').length
)
const acceptedCount = computed(
  () => allRequests.value.filter((item) => item.status === 'accepted').length
)
const rejectedCount = computed(
  () => allRequests.value.filter((item) => item.status === 'rejected').length
)
const historyCount = computed(
  () => allRequests.value.filter((item) => item.status !== 'pending').length
)

const filteredRequests = computed(() =>
  allRequests.value.filter((item) => {
    if (activeTab.value === 'pending') return item.status === 'pending'
    if (activeTab.value === 'history') return item.status !== 'pending'
    return true
  })
)

const emptyStateText = computed(() => {
  if (activeTab.value === 'pending') {
    return 'Сейчас у вас нет заявок, которые ждут рассмотрения.'
  }

  if (activeTab.value === 'history') {
    return 'История пока пустая. Обработанные заявки появятся здесь.'
  }

  return 'Вы ещё не отправляли заявки на заселение или смену комнаты.'
})

const fetchRequests = async () => {
  loading.value = true
  error.value = null

  try {
    const [live, changeRoom] = await Promise.all([
      getMyLiveRequests(),
      getMyChangeRoomRequests(),
    ])

    liveRequests.value = live
    changeRoomRequests.value = changeRoom
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || 'Не удалось загрузить историю заявок'
  } finally {
    loading.value = false
  }
}

const getTypeLabel = (type: StudentRequestType) =>
  type === 'live' ? 'Заселение' : 'Смена комнаты'

const getTitle = (item: StudentRequestItem) =>
  item.type === 'live'
    ? 'Заявка на заселение'
    : 'Заявка на смену комнаты'

const getStatusLabel = (status: StudentRequestItem['status']) => {
  if (status === 'pending') return 'На рассмотрении'
  if (status === 'accepted') return 'Принята'
  if (status === 'rejected') return 'Отклонена'
  return status
}

const getStatusClass = (status: StudentRequestItem['status']) => ({
  pending: status === 'pending',
  accepted: status === 'accepted',
  rejected: status === 'rejected',
})

const getRoomLabel = (room: StudentRequestRoom | null) => {
  const floor = room?.floor
  const building = floor?.building

  if (!room) return 'Комната не указана'

  const parts = [`Комната ${room.room_number || room.id}`]

  if (floor?.floor_number != null) {
    parts.push(`${floor.floor_number} этаж`)
  }

  if (building?.name) {
    parts.push(building.name)
  }

  return parts.join(', ')
}

const getAddress = (room: StudentRequestRoom | null) =>
  room?.floor?.building?.address || 'Не указан'

const getDocumentUrl = (document: StudentRequestDocument) => {
  if (/^https?:\/\//i.test(document.path)) {
    return document.path
  }

  if (document.path.startsWith('/')) {
    return `${baseUrl}${document.path}`
  }

  return `${baseUrl}/${document.path}`
}

const formatDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Дата неизвестна'

  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(fetchRequests)
</script>

<template>
  <section class="requests-page">
    <div class="hero">
      <div>
        <p class="eyebrow">Student / Requests</p>
        <h1>Мои запросы</h1>
        <p class="subtitle">
          Здесь хранится история ваших заявок на заселение и смену комнаты.
          Активные заявки остаются сверху, а обработанные попадают в историю.
        </p>
      </div>

      <button class="refresh-btn" :disabled="loading" @click="fetchRequests">
        {{ loading ? 'Обновление...' : 'Обновить' }}
      </button>
    </div>

    <div class="stats">
      <article class="stat-card">
        <span class="stat-label">Всего</span>
        <strong>{{ totalCount }}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">На рассмотрении</span>
        <strong>{{ pendingCount }}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">Принято</span>
        <strong>{{ acceptedCount }}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">Отклонено</span>
        <strong>{{ rejectedCount }}</strong>
      </article>
    </div>

    <div v-if="error" class="notice error">{{ error }}</div>

    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        Все
        <span class="tab-count">{{ totalCount }}</span>
      </button>

      <button
        class="tab-btn"
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        На рассмотрении
        <span class="tab-count">{{ pendingCount }}</span>
      </button>

      <button
        class="tab-btn"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        История
        <span class="tab-count">{{ historyCount }}</span>
      </button>
    </div>

    <div v-if="loading && !allRequests.length" class="state-card">
      Загрузка заявок...
    </div>

    <div v-else-if="!filteredRequests.length" class="state-card">
      {{ emptyStateText }}
    </div>

    <div v-else class="request-list">
      <article
        v-for="item in filteredRequests"
        :key="item.key"
        class="request-card"
      >
        <div class="request-top">
          <div>
            <div class="type-row">
              <span class="type-badge" :class="item.type">
                {{ getTypeLabel(item.type) }}
              </span>
              <span class="request-id">#{{ item.requestId }}</span>
            </div>

            <h2>{{ getTitle(item) }}</h2>
          </div>

          <span class="status-badge" :class="getStatusClass(item.status)">
            {{ getStatusLabel(item.status) }}
          </span>
        </div>

        <div class="details-grid">
          <div class="detail-card">
            <span class="detail-label">Комната</span>
            <span class="detail-value">{{ getRoomLabel(item.room) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">Адрес</span>
            <span class="detail-value">{{ getAddress(item.room) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">Отправлена</span>
            <span class="detail-value">{{ formatDate(item.createdAt) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">Обновлена</span>
            <span class="detail-value">{{ formatDate(item.updatedAt) }}</span>
          </div>
        </div>

        <div
          v-if="item.type === 'change_room'"
          class="description-card"
        >
          <span class="detail-label">Комментарий</span>
          <span class="detail-value">
            {{ item.description || 'Комментарий не указан' }}
          </span>
        </div>

        <div v-if="item.documents.length" class="documents">
          <span class="detail-label">Документы</span>

          <div class="document-list">
            <a
              v-for="document in item.documents"
              :key="document.id"
              :href="getDocumentUrl(document)"
              class="document-chip"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ document.type }}
            </a>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.requests-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 72px;
  color: #172033;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 28px 32px;
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(91, 79, 255, 0.16), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #f3f2ff 100%);
  border: 1px solid #ddd9ff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5b4fff;
}

h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.05;
  font-weight: 800;
}

.subtitle {
  max-width: 760px;
  margin: 12px 0 0;
  line-height: 1.6;
  color: #526075;
}

.refresh-btn {
  min-width: 148px;
  padding: 12px 18px;
  border: none;
  border-radius: 16px;
  background: #172033;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.refresh-btn:disabled {
  cursor: wait;
  opacity: 0.72;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card,
.state-card,
.request-card {
  background: #fff;
  border: 1px solid #dbe5f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.stat-card {
  padding: 18px 20px;
  border-radius: 22px;
}

.stat-label {
  display: block;
  margin-bottom: 10px;
  color: #68768b;
  font-size: 13px;
}

.stat-card strong {
  font-size: 28px;
  line-height: 1;
}

.notice {
  padding: 14px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
}

.notice.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.tabs {
  display: inline-flex;
  gap: 10px;
  padding: 8px;
  border-radius: 20px;
  background: #eef1fb;
  border: 1px solid #dbe5f0;
  align-self: flex-start;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: #526075;
  font-weight: 700;
  cursor: pointer;
}

.tab-btn.active {
  background: #ffffff;
  color: #172033;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(91, 79, 255, 0.12);
  color: #4c44d4;
  font-size: 12px;
}

.state-card {
  padding: 22px 24px;
  border-radius: 24px;
  color: #526075;
}

.request-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.request-card {
  padding: 24px;
  border-radius: 28px;
}

.request-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.type-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.type-badge,
.request-id,
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.type-badge {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
}

.type-badge.live {
  background: #eef4ff;
  color: #1d4ed8;
}

.type-badge.change_room {
  background: #f3e8ff;
  color: #7c3aed;
}

.request-id {
  color: #718096;
}

.request-top h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.15;
}

.status-badge {
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: 999px;
}

.status-badge.pending {
  background: #fff7ed;
  color: #c2410c;
}

.status-badge.accepted {
  background: #ecfdf3;
  color: #166534;
}

.status-badge.rejected {
  background: #fef2f2;
  color: #b91c1c;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.detail-card,
.description-card {
  padding: 16px 18px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid #e2ebf5;
}

.description-card {
  margin-top: 14px;
}

.detail-label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7a8799;
}

.detail-value {
  color: #172033;
  line-height: 1.5;
}

.documents {
  margin-top: 18px;
}

.document-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.document-chip {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: #eef4ff;
  color: #1d4ed8;
  font-weight: 600;
  text-decoration: none;
}

@media (max-width: 960px) {
  .hero,
  .request-top {
    flex-direction: column;
  }

  .stats,
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .requests-page {
    padding-top: 56px;
  }

  .hero,
  .request-card {
    padding: 20px;
    border-radius: 24px;
  }

  h1 {
    font-size: 28px;
  }

  .refresh-btn {
    width: 100%;
  }
}
</style>

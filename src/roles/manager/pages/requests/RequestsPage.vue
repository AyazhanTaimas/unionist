<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '@/api/instance'
import {
  approveLiveRequest,
  getLiveRequests,
  getUserHousingStatus,
  rejectLiveRequest,
} from './api'
import type {
  ManagerLiveRequest,
  ManagerRequestDocument,
} from './types'
import { useI18n } from '@/app/i18n'

const { t, dateLocale } = useI18n()
const requests = ref<ManagerLiveRequest[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const actionRequestId = ref<number | null>(null)
const actionType = ref<'approve' | 'reject' | null>(null)
const activeTab = ref<'pending' | 'history'>('pending')
const livingStatusByUserId = ref<Record<number, boolean>>({})

const baseUrl = String(api.defaults.baseURL || '').replace(/\/api\/v1\/?$/, '')

const sortedRequests = computed(() =>
  [...requests.value].sort((left, right) => {
    if (left.status === 'pending' && right.status !== 'pending') return -1
    if (left.status !== 'pending' && right.status === 'pending') return 1

    return (
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    )
  })
)

const pendingCount = computed(
  () => requests.value.filter((item) => isPendingReview(item)).length
)

const acceptedCount = computed(
  () => requests.value.filter((item) => item.status === 'accepted').length
)

const rejectedCount = computed(
  () => requests.value.filter((item) => item.status === 'rejected').length
)

const historyCount = computed(
  () => requests.value.filter((item) => isHistoryItem(item)).length
)

const filteredRequests = computed(() =>
  sortedRequests.value.filter((item) =>
    activeTab.value === 'pending'
      ? isPendingReview(item)
      : isHistoryItem(item)
  )
)

const isStudentLiving = (item: ManagerLiveRequest) =>
  Boolean(livingStatusByUserId.value[item.user_id])

const isPendingReview = (item: ManagerLiveRequest) =>
  item.status === 'pending' && !isStudentLiving(item)

const isHistoryItem = (item: ManagerLiveRequest) =>
  item.status !== 'pending' || isStudentLiving(item)

const syncLivingStatuses = async (items: ManagerLiveRequest[]) => {
  const userIds = [...new Set(items.map((item) => item.user_id).filter(Boolean))]

  const entries = await Promise.all(
    userIds.map(async (userId) => {
      try {
        const status = await getUserHousingStatus(userId)
        return [userId, Boolean(status.is_living)] as const
      } catch {
        return [userId, false] as const
      }
    })
  )

  livingStatusByUserId.value = Object.fromEntries(entries)
}

const fetchRequests = async () => {
  loading.value = true
  error.value = null

  try {
    const loadedRequests = await getLiveRequests()
    requests.value = loadedRequests
    await syncLivingStatuses(loadedRequests)
  } catch (requestError) {
    console.error(requestError)
    error.value = t('pages.managerRequests.loadError')
  } finally {
    loading.value = false
  }
}

const getFullName = (item: ManagerLiveRequest) => {
  const student = item.student

  if (!student) return t('pages.managerRequests.studentMissing')

  return [
    student.lastname,
    student.name,
    student.middlename,
  ]
    .filter(Boolean)
    .join(' ') || student.email || t('pages.managerRequests.studentWithId', { id: student.id })
}

const getRoomLabel = (item: ManagerLiveRequest) => {
  const room = item.preferred_room
  const floor = room?.floor
  const building = floor?.building

  if (!room) return t('pages.managerRequests.noRoom')

  const parts = [t('pages.managerRequests.roomLabel', { room: room.room_number || room.id })]

  if (floor?.floor_number != null) {
    parts.push(t('pages.managerRequests.floorLabel', { floor: floor.floor_number }))
  }

  if (building?.name) {
    parts.push(building.name)
  }

  return parts.join(', ')
}

const getStatusLabel = (item: ManagerLiveRequest) => {
  if (item.status === 'pending' && isStudentLiving(item)) return t('pages.managerRequests.alreadySettled')
  const status = item.status
  if (status === 'pending') return t('common.pending')
  if (status === 'accepted') return t('common.accepted')
  if (status === 'rejected') return t('common.rejected')
  return status
}

const getStatusClass = (item: ManagerLiveRequest) => {
  if (item.status === 'pending' && isStudentLiving(item)) {
    return { pending: false, accepted: false, rejected: false, settled: true }
  }

  return {
    pending: item.status === 'pending',
    accepted: item.status === 'accepted',
    rejected: item.status === 'rejected',
    settled: false,
  }
}

const isActing = (id: number, type: 'approve' | 'reject') =>
  actionRequestId.value === id && actionType.value === type

const formatDate = (value: string | null) => {
  if (!value) return t('common.unknownDate')

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return t('common.unknownDate')

  return date.toLocaleString(dateLocale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getDocumentUrl = (document: ManagerRequestDocument) => {
  if (/^https?:\/\//i.test(document.path)) {
    return document.path
  }

  if (document.path.startsWith('/')) {
    return `${baseUrl}${document.path}`
  }

  return `${baseUrl}/${document.path}`
}

const emptyStateText = computed(() =>
  activeTab.value === 'pending'
    ? t('pages.managerRequests.pendingEmpty')
    : t('pages.managerRequests.historyEmpty')
)

const processRequest = async (
  item: ManagerLiveRequest,
  type: 'approve' | 'reject'
) => {
  if (!isPendingReview(item)) return

  const isApprove = type === 'approve'
  const confirmed = confirm(
    isApprove
      ? t('pages.managerRequests.acceptConfirm', { name: getFullName(item) })
      : t('pages.managerRequests.rejectConfirm', { name: getFullName(item) })
  )

  if (!confirmed) return

  actionRequestId.value = item.id
  actionType.value = type
  notice.value = null

  try {
    if (isApprove) {
      await approveLiveRequest(item.id)
      notice.value = t('pages.managerRequests.acceptSuccess')
    } else {
      await rejectLiveRequest(item.id)
      notice.value = t('pages.managerRequests.rejectSuccess')
    }

    await fetchRequests()
  } catch (requestError) {
    console.error(requestError)
    alert(
      isApprove
        ? t('pages.managerRequests.acceptError')
        : t('pages.managerRequests.rejectError')
    )
  } finally {
    actionRequestId.value = null
    actionType.value = null
  }
}

onMounted(fetchRequests)
</script>

<template>
  <section class="requests-page">
    <div class="hero">
      <div>
        <p class="eyebrow">{{ t('pages.managerRequests.eyebrow') }}</p>
        <h1>{{ t('pages.managerRequests.title') }}</h1>
        <p class="subtitle">
          {{ t('pages.managerRequests.subtitle') }}
        </p>
      </div>

      <button class="refresh-btn" :disabled="loading" @click="fetchRequests">
        {{ loading ? t('common.refreshing') : t('common.refresh') }}
      </button>
    </div>

    <div class="stats">
      <article class="stat-card">
        <span class="stat-label">{{ t('common.total') }}</span>
        <strong>{{ requests.length }}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">{{ t('common.pending') }}</span>
        <strong>{{ pendingCount }}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">{{ t('common.accepted') }}</span>
        <strong>{{ acceptedCount }}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">{{ t('common.rejected') }}</span>
        <strong>{{ rejectedCount }}</strong>
      </article>
    </div>

    <div v-if="notice" class="notice success">{{ notice }}</div>
    <div v-if="error" class="notice error">{{ error }}</div>

    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        {{ t('common.pending') }}
        <span class="tab-count">{{ pendingCount }}</span>
      </button>

      <button
        class="tab-btn"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        {{ t('common.history') }}
        <span class="tab-count">{{ historyCount }}</span>
      </button>
    </div>

    <div v-if="loading && !requests.length" class="state-card">
      {{ t('pages.managerRequests.loading') }}
    </div>

    <div v-else-if="!filteredRequests.length" class="state-card">
      {{ emptyStateText }}
    </div>

    <div v-else class="request-list">
      <article
        v-for="item in filteredRequests"
        :key="item.id"
        class="request-card"
      >
        <div class="request-top">
          <div>
            <h2>{{ getFullName(item) }}</h2>
            <p class="meta-row">
              {{ item.student?.uni_id || t('common.noId') }}
              <span class="dot">•</span>
              {{ item.student?.email || t('common.noEmail') }}
            </p>
          </div>

          <span class="status-badge" :class="getStatusClass(item)">
            {{ getStatusLabel(item) }}
          </span>
        </div>

        <div v-if="item.status === 'pending' && isStudentLiving(item)" class="stale-note">
          {{ t('pages.managerRequests.staleNote') }}
        </div>

        <div class="details-grid">
          <div class="detail-card">
            <span class="detail-label">{{ t('common.phone') }}</span>
            <span class="detail-value">
              {{ item.student?.phone_number || t('common.notSpecified') }}
            </span>
          </div>

          <div class="detail-card">
            <span class="detail-label">{{ t('common.room') }}</span>
            <span class="detail-value">{{ getRoomLabel(item) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">{{ t('common.address') }}</span>
            <span class="detail-value">
              {{ item.preferred_room?.floor?.building?.address || t('common.notSpecified') }}
            </span>
          </div>

          <div class="detail-card">
            <span class="detail-label">{{ t('common.sentAt') }}</span>
            <span class="detail-value">{{ formatDate(item.created_at) }}</span>
          </div>
        </div>

        <div v-if="item.documents.length" class="documents">
          <span class="section-label">{{ t('common.documents') }}</span>

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

        <div v-if="isPendingReview(item)" class="actions">
          <button
            class="action-btn approve"
            :disabled="actionRequestId === item.id"
            @click="processRequest(item, 'approve')"
          >
            {{ isActing(item.id, 'approve') ? t('pages.managerRequests.accepting') : t('pages.managerRequests.acceptAction') }}
          </button>

          <button
            class="action-btn reject"
            :disabled="actionRequestId === item.id"
            @click="processRequest(item, 'reject')"
          >
            {{ isActing(item.id, 'reject') ? t('pages.managerRequests.rejecting') : t('pages.managerRequests.rejectAction') }}
          </button>
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
  min-height: 100%;
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
    radial-gradient(circle at top right, rgba(30, 136, 229, 0.18), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #eef7ff 100%);
  border: 1px solid #dbe5f0;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2563eb;
}

h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.05;
  font-weight: 800;
}

.subtitle {
  max-width: 700px;
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

.notice.success {
  background: #edfdf2;
  color: #166534;
  border: 1px solid #bbf7d0;
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
  background: #eef4fb;
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
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
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
  gap: 14px;
}

.request-card {
  padding: 18px 20px;
  border-radius: 24px;
}

.request-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.request-top h2 {
  margin: 0 0 6px;
  font-size: 22px;
  line-height: 1.15;
}

.meta-row {
  margin: 0;
  color: #68768b;
  line-height: 1.4;
}

.dot {
  margin: 0 8px;
}

.status-badge {
  flex-shrink: 0;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
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

.status-badge.settled {
  background: #eff6ff;
  color: #1d4ed8;
}

.stale-note {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  line-height: 1.4;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.detail-card {
  padding: 12px 14px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #e2ebf5;
}

.detail-label,
.section-label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #7a8799;
}

.detail-value {
  color: #172033;
  line-height: 1.35;
}

.documents {
  margin-top: 14px;
}

.document-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.document-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eef4ff;
  color: #1d4ed8;
  font-weight: 600;
  text-decoration: none;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.action-btn {
  min-width: 138px;
  padding: 10px 16px;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.action-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.action-btn.approve {
  background: #dcfce7;
  color: #166534;
}

.action-btn.reject {
  background: #fee2e2;
  color: #b91c1c;
}

@media (max-width: 1200px) {
  .details-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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

@media (max-width: 640px) {
  .hero,
  .request-card {
    padding: 20px;
    border-radius: 24px;
  }

  h1 {
    font-size: 28px;
  }

  .actions {
    flex-direction: column;
  }

  .action-btn,
  .refresh-btn {
    width: 100%;
  }

  .meta-row .dot {
    display: none;
  }
}
</style>

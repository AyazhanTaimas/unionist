<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  approveChangeRoomRequest,
  getChangeRoomRequests,
  getUserHousingStatus,
  rejectChangeRoomRequest,
} from './api'
import type {
  ManagerChangeRoomRequest,
  ManagerRequestRoom,
  ManagerRequestStudent,
  ManagerSettlementStatus,
} from './types'
import { useI18n } from '@/app/i18n'

const { t, dateLocale } = useI18n()
const requests = ref<ManagerChangeRoomRequest[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const actionRequestId = ref<number | null>(null)
const actionType = ref<'approve' | 'reject' | null>(null)
const activeTab = ref<'pending' | 'history'>('pending')
const housingStatusByUserId = ref<Record<number, ManagerSettlementStatus>>({})

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
  () => requests.value.filter((item) => item.status === 'pending').length
)

const acceptedCount = computed(
  () => requests.value.filter((item) => item.status === 'accepted').length
)

const rejectedCount = computed(
  () => requests.value.filter((item) => item.status === 'rejected').length
)

const historyCount = computed(
  () => requests.value.filter((item) => item.status !== 'pending').length
)

const filteredRequests = computed(() =>
  sortedRequests.value.filter((item) =>
    activeTab.value === 'pending'
      ? item.status === 'pending'
      : item.status !== 'pending'
  )
)

const getStudent = (item: ManagerChangeRoomRequest): ManagerRequestStudent | null =>
  item.student?.user || null

const isStudentLiving = (item: ManagerChangeRoomRequest) =>
  Boolean(housingStatusByUserId.value[item.student_id]?.is_living)

const getCurrentSettlement = (item: ManagerChangeRoomRequest) =>
  housingStatusByUserId.value[item.student_id]?.settlement || null

const canApprove = (item: ManagerChangeRoomRequest) =>
  item.status === 'pending' && isStudentLiving(item)

const canReject = (item: ManagerChangeRoomRequest) => item.status === 'pending'

const syncHousingStatuses = async (items: ManagerChangeRoomRequest[]) => {
  const userIds = [...new Set(items.map((item) => item.student_id).filter(Boolean))]

  const entries = await Promise.all(
    userIds.map(async (userId) => {
      try {
        const status = await getUserHousingStatus(userId)
        return [userId, status] as const
      } catch {
        return [
          userId,
          {
            is_living: false,
            settlement: null,
          },
        ] as const
      }
    })
  )

  housingStatusByUserId.value = Object.fromEntries(entries)
}

const fetchRequests = async () => {
  loading.value = true
  error.value = null

  try {
    const loadedRequests = await getChangeRoomRequests()
    requests.value = loadedRequests
    await syncHousingStatuses(loadedRequests)
  } catch (requestError) {
    console.error(requestError)
    error.value = t('pages.managerChangeRoom.loadError')
  } finally {
    loading.value = false
  }
}

const getFullName = (item: ManagerChangeRoomRequest) => {
  const student = getStudent(item)

  if (!student) return t('pages.managerChangeRoom.studentMissing')

  return [
    student.lastname,
    student.name,
    student.middlename,
  ]
    .filter(Boolean)
    .join(' ') || student.email || t('pages.managerChangeRoom.studentWithId', { id: student.id })
}

const getRoomLabel = (room: ManagerRequestRoom | null) => {
  const floor = room?.floor
  const building = floor?.building

  if (!room) return t('pages.managerChangeRoom.noRoom')

  const parts = [t('pages.managerChangeRoom.roomLabel', { room: room.room_number || room.id })]

  if (floor?.floor_number != null) {
    parts.push(t('pages.managerChangeRoom.floorLabel', { floor: floor.floor_number }))
  }

  if (building?.name) {
    parts.push(building.name)
  }

  return parts.join(', ')
}

const getCurrentRoomLabel = (item: ManagerChangeRoomRequest) => {
  const settlement = getCurrentSettlement(item)

  if (!settlement?.room) return t('pages.managerChangeRoom.noActiveSettlement')

  return getRoomLabel(settlement.room)
}

const getTargetRoomLabel = (item: ManagerChangeRoomRequest) => getRoomLabel(item.room)

const getTargetAddress = (item: ManagerChangeRoomRequest) =>
  item.room?.floor?.building?.address || t('common.notSpecified')

const getStatusLabel = (item: ManagerChangeRoomRequest) => {
  if (item.status === 'pending' && !isStudentLiving(item)) {
    return t('pages.managerChangeRoom.noActiveSettlementStatus')
  }

  if (item.status === 'pending') return t('common.pending')
  if (item.status === 'accepted') return t('common.accepted')
  if (item.status === 'rejected') return t('common.rejected')
  return item.status
}

const getStatusClass = (item: ManagerChangeRoomRequest) => ({
  pending: item.status === 'pending' && isStudentLiving(item),
  accepted: item.status === 'accepted',
  rejected: item.status === 'rejected',
  stale: item.status === 'pending' && !isStudentLiving(item),
})

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

const emptyStateText = computed(() =>
  activeTab.value === 'pending'
    ? t('pages.managerChangeRoom.pendingEmpty')
    : t('pages.managerChangeRoom.historyEmpty')
)

const processRequest = async (
  item: ManagerChangeRoomRequest,
  type: 'approve' | 'reject'
) => {
  if (type === 'approve' && !canApprove(item)) {
    alert(t('pages.managerChangeRoom.cannotAccept'))
    return
  }

  if (type === 'reject' && !canReject(item)) return

  const isApprove = type === 'approve'
  const confirmed = confirm(
    isApprove
      ? t('pages.managerChangeRoom.acceptConfirm', { name: getFullName(item) })
      : t('pages.managerChangeRoom.rejectConfirm', { name: getFullName(item) })
  )

  if (!confirmed) return

  actionRequestId.value = item.id
  actionType.value = type
  notice.value = null

  try {
    if (isApprove) {
      await approveChangeRoomRequest(item.id)
      notice.value = t('pages.managerChangeRoom.acceptSuccess')
    } else {
      await rejectChangeRoomRequest(item.id)
      notice.value = t('pages.managerChangeRoom.rejectSuccess')
    }

    await fetchRequests()
  } catch (requestError) {
    console.error(requestError)
    alert(
      isApprove
        ? t('pages.managerChangeRoom.acceptError')
        : t('pages.managerChangeRoom.rejectError')
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
        <p class="eyebrow">{{ t('pages.managerChangeRoom.eyebrow') }}</p>
        <h1>{{ t('pages.managerChangeRoom.title') }}</h1>
        <p class="subtitle">
          {{ t('pages.managerChangeRoom.subtitle') }}
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
      {{ t('pages.managerChangeRoom.loading') }}
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
              {{ getStudent(item)?.uni_id || t('common.noId') }}
              <span class="dot">•</span>
              {{ getStudent(item)?.email || t('common.noEmail') }}
            </p>
          </div>

          <span class="status-badge" :class="getStatusClass(item)">
            {{ getStatusLabel(item) }}
          </span>
        </div>

        <div
          v-if="item.status === 'pending' && !isStudentLiving(item)"
          class="stale-note"
        >
          {{ t('pages.managerChangeRoom.staleNote') }}
        </div>

        <div class="details-grid">
          <div class="detail-card">
            <span class="detail-label">{{ t('common.phone') }}</span>
            <span class="detail-value">
              {{ getStudent(item)?.phone_number || t('common.notSpecified') }}
            </span>
          </div>

          <div class="detail-card">
            <span class="detail-label">{{ t('pages.managerChangeRoom.currentRoom') }}</span>
            <span class="detail-value">{{ getCurrentRoomLabel(item) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">{{ t('pages.managerChangeRoom.targetRoom') }}</span>
            <span class="detail-value">{{ getTargetRoomLabel(item) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">{{ t('pages.managerChangeRoom.targetAddress') }}</span>
            <span class="detail-value">{{ getTargetAddress(item) }}</span>
          </div>

          <div class="detail-card detail-card--wide">
            <span class="detail-label">{{ t('common.comment') }}</span>
            <span class="detail-value">
              {{ item.description || t('pages.managerChangeRoom.noComment') }}
            </span>
          </div>

          <div class="detail-card">
            <span class="detail-label">{{ t('common.sentAt') }}</span>
            <span class="detail-value">{{ formatDate(item.created_at) }}</span>
          </div>
        </div>

        <div v-if="canApprove(item) || canReject(item)" class="actions">
          <button
            v-if="canApprove(item)"
            class="action-btn approve"
            :disabled="actionRequestId === item.id"
            @click="processRequest(item, 'approve')"
          >
            {{ isActing(item.id, 'approve') ? t('pages.managerChangeRoom.accepting') : t('pages.managerChangeRoom.acceptAction') }}
          </button>

          <button
            v-if="canReject(item)"
            class="action-btn reject"
            :disabled="actionRequestId === item.id"
            @click="processRequest(item, 'reject')"
          >
            {{ isActing(item.id, 'reject') ? t('pages.managerChangeRoom.rejecting') : t('pages.managerChangeRoom.rejectAction') }}
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
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.18), transparent 28%),
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

.status-badge.stale {
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
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.detail-card {
  padding: 12px 14px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #e2ebf5;
}

.detail-card--wide {
  grid-column: 1 / -1;
}

.detail-label {
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

@media (max-width: 1280px) {
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

  .detail-card--wide {
    grid-column: auto;
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

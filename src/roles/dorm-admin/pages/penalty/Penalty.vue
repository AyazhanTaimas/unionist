<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/app/i18n'
import CreatePenaltyModal from './CreatePenaltyModal.vue'
import {
  approvePenaltyRedemption,
  cancelPenalty,
  getManagedPenalties,
  rejectPenaltyRedemption,
  type ManagedPenalty,
} from './api'

type FilterStatus = 'all' | 'active' | 'resolved' | 'cancelled' | 'pending'

const penalties = ref<ManagedPenalty[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const showModal = ref(false)
const search = ref('')
const statusFilter = ref<FilterStatus>('all')
const actionKey = ref<string | null>(null)
const { t, locale, dateLocale } = useI18n()

const filteredPenalties = computed(() => {
  const query = search.value.trim().toLowerCase()

  return penalties.value.filter((penalty) => {
    const matchesStatus =
      statusFilter.value === 'all'
        ? true
        : statusFilter.value === 'pending'
          ? Boolean(penalty.pending_redemption)
          : penalty.status === statusFilter.value

    if (!matchesStatus) return false
    if (!query) return true

    const searchable = [
      penalty.student?.full_name,
      penalty.student?.email,
      penalty.student?.uni_id,
      penalty.room.label,
      penalty.rule?.title,
      penalty.rule?.code,
      penalty.description,
      penalty.status,
      penalty.pending_redemption?.event_type,
      penalty.pending_redemption?.description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(query)
  })
})

const stats = computed(() => ({
  total: penalties.value.length,
  active: penalties.value.filter((penalty) => penalty.status === 'active').length,
  resolved: penalties.value.filter((penalty) => penalty.status === 'resolved')
    .length,
  pendingRedemptions: penalties.value.filter((penalty) =>
    Boolean(penalty.pending_redemption)
  ).length,
}))

const limitAlerts = computed(() => {
  const seen = new Set<number>()

  return penalties.value
    .filter((penalty) => penalty.discipline?.limit_reached && penalty.student)
    .filter((penalty) => {
      const studentId = penalty.student?.id
      if (!studentId || seen.has(studentId)) return false

      seen.add(studentId)
      return true
    })
})

const disciplineScore = (penalty: ManagedPenalty) =>
  `${penalty.discipline?.active_points ?? 0} / ${penalty.discipline?.discipline_limit ?? penalty.student?.discipline_limit ?? 0}`

const fetchPenalties = async () => {
  loading.value = true
  error.value = null

  try {
    penalties.value = await getManagedPenalties()
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || t('pages.penalty.loadError')
    penalties.value = []
  } finally {
    loading.value = false
  }
}

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

const getInitials = (fullName?: string | null) =>
  (fullName || 'NA')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

const statusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return t('pages.penalty.statusActive')
    case 'resolved':
      return t('pages.penalty.statusResolved')
    case 'cancelled':
      return t('pages.penalty.statusCancelled')
    default:
      return status
  }
}

const redemptionLabel = (status: string | null) => {
  switch (status) {
    case 'pending':
      return t('pages.penalty.redemptionPending')
    case 'approved':
      return t('pages.penalty.redemptionApproved')
    case 'rejected':
      return t('pages.penalty.redemptionRejected')
    default:
      return t('pages.penalty.noRedemption')
  }
}

const pointsLabel = (points: number) => {
  const absolutePoints = Math.abs(points)
  const key =
    (locale.value === 'ru' &&
      absolutePoints % 10 === 1 &&
      absolutePoints % 100 !== 11) ||
    (locale.value === 'en' && absolutePoints === 1)
      ? 'pages.penalty.pointsCountOne'
      : 'pages.penalty.pointsCountMany'

  return t(key, { count: points })
}

const isExternalLink = (value: string) => /^https?:\/\//i.test(value)

const getEvidenceLink = (filePath: string, url?: string | null) => url || filePath

const handleCreated = async (message: string) => {
  notice.value = message
  error.value = null
  showModal.value = false
  await fetchPenalties()
  window.dispatchEvent(new Event('app:notifications-refresh'))
}

const cancelPenaltyItem = async (penalty: ManagedPenalty) => {
  const description = window.prompt(
    t('pages.penalty.cancelPrompt'),
    penalty.description || ''
  )

  if (description === null) return

  actionKey.value = `cancel-${penalty.id}`
  error.value = null
  notice.value = null

  try {
    await cancelPenalty(penalty.id, description.trim() || undefined)
    notice.value = t('pages.penalty.cancelSuccess')
    await fetchPenalties()
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || t('pages.penalty.cancelError')
  } finally {
    actionKey.value = null
  }
}

const approveRedemption = async (penalty: ManagedPenalty) => {
  const redemption = penalty.pending_redemption
  if (!redemption) return

  const confirmed = window.confirm(t('pages.penalty.approveConfirm'))
  if (!confirmed) return

  actionKey.value = `approve-${redemption.id}`
  error.value = null
  notice.value = null

  try {
    await approvePenaltyRedemption(redemption.id)
    notice.value = t('pages.penalty.approveSuccess')
    await fetchPenalties()
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || t('pages.penalty.approveError')
  } finally {
    actionKey.value = null
  }
}

const rejectRedemption = async (penalty: ManagedPenalty) => {
  const redemption = penalty.pending_redemption
  if (!redemption) return

  const confirmed = window.confirm(t('pages.penalty.rejectConfirm'))
  if (!confirmed) return

  actionKey.value = `reject-${redemption.id}`
  error.value = null
  notice.value = null

  try {
    await rejectPenaltyRedemption(redemption.id)
    notice.value = t('pages.penalty.rejectSuccess')
    await fetchPenalties()
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || t('pages.penalty.rejectError')
  } finally {
    actionKey.value = null
  }
}

onMounted(fetchPenalties)
</script>

<template>
  <section class="penalties-page">
    <div class="hero">
      <div>
        <p class="eyebrow">{{ t('pages.penalty.dormEyebrow') }}</p>
        <h1>{{ t('pages.penalty.dormTitle') }}</h1>
        <p class="description">
          {{ t('pages.penalty.dormSubtitle') }}
        </p>
      </div>

      <div class="hero-actions">
        <button class="secondary-btn" :disabled="loading" @click="fetchPenalties">
          {{ loading ? t('common.refreshing') : t('common.refresh') }}
        </button>

        <button class="primary-btn" @click="showModal = true">
          {{ t('pages.penalty.create') }}
        </button>
      </div>
    </div>

    <div class="stats">
      <article class="stat-card">
        <span>{{ t('pages.penalty.total') }}</span>
        <strong>{{ stats.total }}</strong>
      </article>

      <article class="stat-card">
        <span>{{ t('pages.penalty.active') }}</span>
        <strong>{{ stats.active }}</strong>
      </article>

      <article class="stat-card">
        <span>{{ t('pages.penalty.closed') }}</span>
        <strong>{{ stats.resolved }}</strong>
      </article>

      <article class="stat-card warning">
        <span>{{ t('pages.penalty.redemptionRequests') }}</span>
        <strong>{{ stats.pendingRedemptions }}</strong>
      </article>
    </div>

    <div v-if="limitAlerts.length" class="limit-alerts">
      <article
        v-for="penalty in limitAlerts"
        :key="penalty.student?.id"
        class="limit-alert"
      >
        <strong>
          {{ t('pages.penalty.limitReachedManagerTitle', {
            name: penalty.student?.full_name || t('pages.penalty.studentMissing'),
          }) }}
        </strong>
        <span>
          {{ t('pages.penalty.limitReachedManagerText', {
            score: disciplineScore(penalty),
          }) }}
        </span>
      </article>
    </div>

    <div v-if="notice" class="notice success">{{ notice }}</div>
    <div v-if="error" class="notice error">{{ error }}</div>

    <div class="toolbar">
      <input
        v-model="search"
        class="search-input"
        type="text"
        :placeholder="t('pages.penalty.searchPlaceholder')"
      />

      <select v-model="statusFilter" class="status-select">
        <option value="all">{{ t('pages.penalty.allStatuses') }}</option>
        <option value="active">{{ t('pages.penalty.active') }}</option>
        <option value="resolved">{{ t('pages.penalty.closed') }}</option>
        <option value="cancelled">{{ t('common.cancelled') }}</option>
        <option value="pending">{{ t('pages.penalty.hasRedemption') }}</option>
      </select>
    </div>

    <div v-if="loading && !penalties.length" class="state-card">
      {{ t('pages.penalty.loading') }}
    </div>

    <div v-else-if="!filteredPenalties.length" class="state-card">
      {{ penalties.length ? t('pages.penalty.noFilterItems') : t('pages.penalty.noItems') }}
    </div>

    <div v-else class="penalties-grid">
      <article
        v-for="penalty in filteredPenalties"
        :key="penalty.id"
        class="penalty-card"
      >
        <div class="card-head">
          <div>
            <p class="rule-code">{{ penalty.rule?.code || 'PENALTY' }}</p>
            <h2>{{ penalty.rule?.title || t('pages.penalty.untitled') }}</h2>
          </div>

          <span class="status-badge" :class="penalty.status">
            {{ statusLabel(penalty.status) }}
          </span>
        </div>

        <div class="subject-row">
          <div class="avatar">
            {{ getInitials(penalty.student?.full_name) }}
          </div>

          <div>
            <div class="student-name">
              {{ penalty.student?.full_name || t('pages.penalty.studentMissing') }}
            </div>
            <div class="student-meta">
              {{ penalty.room.label }}
              <span v-if="penalty.student?.uni_id">• {{ penalty.student.uni_id }}</span>
            </div>
          </div>
        </div>

        <div v-if="penalty.discipline?.limit_reached" class="limit-badge">
          {{ t('pages.penalty.limitReachedBadge', {
            score: disciplineScore(penalty),
          }) }}
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <span>{{ t('pages.penalty.points') }}</span>
            <strong>{{ pointsLabel(penalty.points) }}</strong>
          </div>

          <div class="detail-item">
            <span>{{ t('pages.penalty.issued') }}</span>
            <strong>{{ formatDate(penalty.created_at) }}</strong>
          </div>

          <div class="detail-item">
            <span>{{ t('common.createdBy') }}</span>
            <strong>{{ penalty.created_by?.full_name || t('common.unknown') }}</strong>
          </div>

          <div class="detail-item">
            <span>{{ t('pages.penalty.lastRedemption') }}</span>
            <strong>{{ redemptionLabel(penalty.latest_redemption_status) }}</strong>
          </div>
        </div>

        <p v-if="penalty.description" class="description-text">
          {{ penalty.description }}
        </p>

        <div v-if="penalty.evidences.length" class="evidence-block">
          <span class="section-label">{{ t('pages.penalty.evidence') }}</span>

          <div class="evidence-list">
            <template v-for="evidence in penalty.evidences" :key="evidence.id">
              <a
                v-if="isExternalLink(getEvidenceLink(evidence.file_path, evidence.url))"
                class="evidence-chip"
                :href="getEvidenceLink(evidence.file_path, evidence.url)"
                target="_blank"
                rel="noreferrer"
              >
                {{ evidence.file_path }}
              </a>

              <span v-else class="evidence-chip">
                {{ evidence.file_path }}
              </span>
            </template>
          </div>
        </div>

        <div v-if="penalty.pending_redemption" class="redemption-card">
          <div class="redemption-head">
            <div>
              <span class="section-label">{{ t('pages.penalty.redeemRequest') }}</span>
              <h3>{{ penalty.pending_redemption.event_type }}</h3>
            </div>

            <span class="redemption-status">
              {{ redemptionLabel(penalty.pending_redemption.status || 'pending') }}
            </span>
          </div>

          <p class="redemption-description">
            {{ penalty.pending_redemption.description }}
          </p>

          <div class="redemption-meta">
            <span>
              {{ t('pages.penalty.student') }}:
              {{ penalty.pending_redemption.user?.full_name || t('common.unknown') }}
            </span>
            <span>
              {{ t('common.sentAt') }}:
              {{ formatDate(penalty.pending_redemption.created_at) }}
            </span>
          </div>

          <div
            v-if="penalty.pending_redemption.file_path"
            class="redemption-file"
          >
            {{ t('common.file') }}:
            <a
              v-if="isExternalLink(penalty.pending_redemption.file_path)"
              :href="penalty.pending_redemption.file_path"
              target="_blank"
              rel="noreferrer"
            >
              {{ penalty.pending_redemption.file_path }}
            </a>
            <span v-else>{{ penalty.pending_redemption.file_path }}</span>
          </div>

          <div class="action-row">
            <button
              class="approve-btn"
              :disabled="actionKey === `approve-${penalty.pending_redemption.id}`"
              @click="approveRedemption(penalty)"
            >
              {{
                actionKey === `approve-${penalty.pending_redemption.id}`
                  ? t('common.saving')
                  : t('pages.penalty.approve')
              }}
            </button>

            <button
              class="reject-btn"
              :disabled="actionKey === `reject-${penalty.pending_redemption.id}`"
              @click="rejectRedemption(penalty)"
            >
              {{
                actionKey === `reject-${penalty.pending_redemption.id}`
                  ? t('common.saving')
                  : t('pages.penalty.reject')
              }}
            </button>
          </div>
        </div>

        <div class="footer-row">
          <span class="footer-note">
            {{ t('common.email') }}: {{ penalty.student?.email || t('common.notSpecified') }}
          </span>

          <button
            v-if="penalty.status === 'active'"
            class="cancel-btn"
            :disabled="actionKey === `cancel-${penalty.id}`"
            @click="cancelPenaltyItem(penalty)"
          >
            {{ actionKey === `cancel-${penalty.id}` ? t('pages.penalty.cancelling') : t('pages.penalty.cancelPenalty') }}
          </button>
        </div>
      </article>
    </div>
  </section>

  <CreatePenaltyModal
    v-if="showModal"
    @close="showModal = false"
    @created="handleCreated"
  />
</template>

<style scoped lang="scss">
.penalties-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100%;
  color: #172033;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  padding: 28px 32px;
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(217, 119, 6, 0.18), transparent 32%),
    linear-gradient(135deg, #ffffff 0%, #fff7ed 100%);
  border: 1px solid #eadbc8;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #b45309;
}

h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.05;
  font-weight: 800;
}

.description {
  margin: 12px 0 0;
  max-width: 760px;
  line-height: 1.6;
  color: #5c6578;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.approve-btn,
.reject-btn,
.cancel-btn {
  border: none;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn,
.secondary-btn {
  min-width: 168px;
  height: 48px;
  padding: 0 18px;
}

.primary-btn {
  background: #172033;
  color: #ffffff;
}

.secondary-btn {
  background: #fff1e3;
  color: #9a3412;
}

.primary-btn:disabled,
.secondary-btn:disabled,
.approve-btn:disabled,
.reject-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card,
.state-card,
.penalty-card {
  background: #ffffff;
  border: 1px solid #dbe5f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.stat-card {
  padding: 18px 20px;
  border-radius: 22px;
}

.stat-card.warning {
  background: #fff7ed;
  border-color: #fed7aa;
}

.stat-card span {
  display: block;
  margin-bottom: 10px;
  color: #68768b;
  font-size: 13px;
}

.stat-card strong {
  font-size: 28px;
  line-height: 1;
}

.limit-alerts {
  display: grid;
  gap: 12px;
}

.limit-alert {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 16px 18px;
  border-radius: 18px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  color: #991b1b;
}

.limit-alert strong {
  font-size: 16px;
}

.limit-alert span {
  color: #b91c1c;
  line-height: 1.45;
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

.toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input,
.status-select {
  height: 50px;
  padding: 0 16px;
  border: 1px solid #dbe5f0;
  border-radius: 16px;
  background: #ffffff;
  color: #172033;
}

.search-input {
  width: min(460px, 100%);
}

.status-select {
  min-width: 220px;
}

.state-card {
  padding: 24px;
  border-radius: 24px;
  color: #526075;
}

.penalties-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

.penalty-card {
  padding: 22px;
  border-radius: 28px;
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.rule-code {
  margin: 0 0 8px;
  color: #b45309;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.card-head h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}

.status-badge,
.redemption-status {
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.active {
  background: #fef2f2;
  color: #b91c1c;
}

.status-badge.resolved {
  background: #ecfdf3;
  color: #15803d;
}

.status-badge.cancelled {
  background: #f1f5f9;
  color: #475569;
}

.subject-row {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-top: 18px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #fff1e3;
  color: #9a3412;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.student-name {
  font-size: 18px;
  font-weight: 700;
}

.student-meta {
  margin-top: 6px;
  color: #68768b;
  line-height: 1.5;
}

.limit-badge {
  display: inline-flex;
  width: fit-content;
  margin-top: 16px;
  padding: 9px 12px;
  border-radius: 999px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 13px;
  font-weight: 800;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.detail-item {
  padding: 14px 16px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid #e2ebf5;
}

.detail-item span,
.section-label {
  display: block;
  margin-bottom: 8px;
  color: #7a8799;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-item strong {
  color: #172033;
  line-height: 1.5;
}

.description-text {
  margin: 18px 0 0;
  color: #475569;
  line-height: 1.6;
}

.evidence-block,
.redemption-card {
  margin-top: 18px;
}

.evidence-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.evidence-chip {
  max-width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  background: #eef4ff;
  color: #1d4ed8;
  font-size: 13px;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.redemption-card {
  padding: 16px;
  border-radius: 20px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.redemption-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.redemption-head h3 {
  margin: 0;
  font-size: 18px;
}

.redemption-status {
  background: #fff1e3;
  color: #c2410c;
}

.redemption-description {
  margin: 14px 0 0;
  color: #7c2d12;
  line-height: 1.6;
}

.redemption-meta,
.redemption-file {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-top: 12px;
  color: #9a3412;
  font-size: 14px;
}

.redemption-file a {
  color: inherit;
}

.action-row,
.footer-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-top: 18px;
}

.approve-btn,
.reject-btn,
.cancel-btn {
  height: 42px;
  padding: 0 14px;
}

.approve-btn {
  background: #166534;
  color: #ffffff;
}

.reject-btn {
  background: #fee2e2;
  color: #b91c1c;
}

.cancel-btn {
  background: #fff1e3;
  color: #c2410c;
}

.footer-note {
  color: #68768b;
  font-size: 13px;
}

@media (max-width: 1200px) {
  .stats,
  .penalties-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .hero,
  .card-head,
  .footer-row,
  .action-row,
  .redemption-head,
  .limit-alert {
    flex-direction: column;
  }

  .hero {
    padding: 22px;
    border-radius: 24px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .search-input,
  .status-select,
  .primary-btn,
  .secondary-btn,
  .approve-btn,
  .reject-btn,
  .cancel-btn {
    width: 100%;
  }

  .hero-actions {
    width: 100%;
  }
}
</style>

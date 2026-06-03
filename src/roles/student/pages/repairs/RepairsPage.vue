<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  createRepairRequest,
  getMyRepairRequests,
  getRepairRequestCategoryLabel,
  getRepairRequestStatusLabel,
  REPAIR_REQUEST_CATEGORY_OPTIONS,
  resolveRepairRequestAssetUrl,
  type RepairRequestItem,
  type RepairRequestStatus,
} from '@/api/repairRequests'
import { getDateLocale, useI18n } from '@/app/i18n'

type RepairsTab = 'all' | 'open' | 'resolved'

const { t } = useI18n()
const requests = ref<RepairRequestItem[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const activeTab = ref<RepairsTab>('all')
const selectedFiles = ref<File[]>([])

const form = ref({
  category: 'plumbing',
  title: '',
  description: '',
})

const sortedRequests = computed(() =>
  [...requests.value].sort((left, right) => {
    const leftPriority = left.status === 'pending' ? 0 : left.status === 'in_progress' ? 1 : 2
    const rightPriority = right.status === 'pending' ? 0 : right.status === 'in_progress' ? 1 : 2

    if (leftPriority !== rightPriority) return leftPriority - rightPriority

    return (
      new Date(right.created_at || '').getTime() - new Date(left.created_at || '').getTime()
    )
  })
)

const totalCount = computed(() => requests.value.length)
const openCount = computed(
  () => requests.value.filter((item) => item.status !== 'resolved').length
)
const inProgressCount = computed(
  () => requests.value.filter((item) => item.status === 'in_progress').length
)
const resolvedCount = computed(
  () => requests.value.filter((item) => item.status === 'resolved').length
)

const filteredRequests = computed(() =>
  sortedRequests.value.filter((item) => {
    if (activeTab.value === 'open') return item.status !== 'resolved'
    if (activeTab.value === 'resolved') return item.status === 'resolved'
    return true
  })
)

const emptyStateText = computed(() => {
  if (activeTab.value === 'open') {
    return t('repair.openEmpty')
  }

  if (activeTab.value === 'resolved') {
    return t('repair.resolvedEmpty')
  }

  return t('repair.allEmpty')
})

const fetchRequests = async () => {
  loading.value = true
  error.value = null

  try {
    requests.value = await getMyRepairRequests()
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || t('repair.loadError')
    requests.value = []
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    category: 'plumbing',
    title: '',
    description: '',
  }
  selectedFiles.value = []
}

const handleFilesChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectedFiles.value = Array.from(input.files || []).slice(0, 5)
}

const submitRequest = async () => {
  error.value = null
  notice.value = null

  if (!form.value.title.trim() || !form.value.description.trim()) {
    error.value = t('repair.validationRequired')
    return
  }

  const payload = new FormData()
  payload.append('category', form.value.category)
  payload.append('title', form.value.title.trim())
  payload.append('description', form.value.description.trim())

  selectedFiles.value.forEach((file) => {
    payload.append('photos[]', file)
  })

  submitting.value = true

  try {
    const response = await createRepairRequest(payload)
    notice.value = response.message
    resetForm()
    await fetchRequests()
  } catch (requestError: any) {
    const responseData = requestError?.response?.data
    error.value =
      responseData?.errors?.description?.[0] ||
      responseData?.errors?.title?.[0] ||
      responseData?.message ||
      t('repair.submitError')
  } finally {
    submitting.value = false
  }
}

const formatDate = (value: string | null) => {
  if (!value) return t('common.unknownDate')

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return t('common.unknownDate')

  return date.toLocaleString(getDateLocale(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusClass = (status: RepairRequestStatus) => ({
  pending: status === 'pending',
  inprogress: status === 'in_progress',
  resolved: status === 'resolved',
})

const getRoomLabel = (item: RepairRequestItem) => {
  const room = item.room
  const floor = room?.floor
  const building = floor?.building

  if (!room) return t('pages.myRequests.noRoom')

  const parts = [t('pages.housing.roomLabel', { room: room.room_number || room.id || '' })]

  if (floor?.floor_number != null) {
    parts.push(`${floor.floor_number} ${t('common.floor')}`)
  }

  if (building?.name) {
    parts.push(building.name)
  }

  return parts.join(', ')
}

const getAddress = (item: RepairRequestItem) =>
  item.room?.floor?.building?.address || t('common.notSpecified')

onMounted(fetchRequests)
</script>

<template>
  <section class="repairs-page">
    <div class="hero">
      <div>
        <p class="eyebrow">{{ t('repair.studentEyebrow') }}</p>
        <h1>{{ t('repair.studentHeroTitle') }}</h1>
        <p class="subtitle">
          {{ t('repair.studentHeroSubtitle') }}
        </p>
      </div>

      <button class="refresh-btn" :disabled="loading" @click="fetchRequests">
        {{ loading ? t('common.refreshing') : t('common.refresh') }}
      </button>
    </div>

    <div class="stats">
      <article class="stat-card">
        <span class="stat-label">{{ t('common.total') }}</span>
        <strong>{{ totalCount }}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">{{ t('common.active') }}</span>
        <strong>{{ openCount }}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">{{ t('repair.statuses.in_progress') }}</span>
        <strong>{{ inProgressCount }}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">{{ t('repair.statuses.resolved') }}</span>
        <strong>{{ resolvedCount }}</strong>
      </article>
    </div>

    <div class="content-grid">
      <div class="form-card">
        <h2>{{ t('repair.newRequest') }}</h2>

        <div v-if="notice" class="notice success">{{ notice }}</div>
        <div v-if="error" class="notice error">{{ error }}</div>

        <label class="field">
          <span class="field-label">{{ t('repair.category') }}</span>
          <select v-model="form.category" class="field-input">
            <option
              v-for="option in REPAIR_REQUEST_CATEGORY_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ t(option.labelKey) }}
            </option>
          </select>
        </label>

        <label class="field">
          <span class="field-label">{{ t('repair.shortProblem') }}</span>
          <input
            v-model="form.title"
            class="field-input"
            type="text"
            maxlength="255"
            :placeholder="t('repair.shortProblemPlaceholder')"
          />
        </label>

        <label class="field">
          <span class="field-label">{{ t('repair.description') }}</span>
          <textarea
            v-model="form.description"
            class="field-input field-input--textarea"
            maxlength="2000"
            :placeholder="t('repair.descriptionPlaceholder')"
          />
        </label>

        <label class="field">
          <span class="field-label">{{ t('repair.optionalPhoto') }}</span>
          <input
            class="field-input field-input--file"
            type="file"
            accept="image/*"
            multiple
            @change="handleFilesChange"
          />
        </label>

        <div v-if="selectedFiles.length" class="files-box">
          <span class="field-label">{{ t('repair.selectedFiles', { count: selectedFiles.length }) }}</span>
          <div class="file-list">
            <span v-for="file in selectedFiles" :key="file.name" class="file-chip">
              {{ file.name }}
            </span>
          </div>
        </div>

        <button
          class="primary-btn"
          :disabled="submitting"
          @click="submitRequest"
        >
          {{ submitting ? t('common.sending') : t('repair.submitRequest') }}
        </button>
      </div>

      <div class="info-card">
        <h2>{{ t('repair.howItWorks') }}</h2>
        <ol class="steps-list">
          <li>{{ t('repair.stepDescribe') }}</li>
          <li>{{ t('repair.stepEmployee') }}</li>
          <li>{{ t('repair.stepClose') }}</li>
        </ol>
      </div>
    </div>

    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        {{ t('common.all') }}
        <span class="tab-count">{{ totalCount }}</span>
      </button>

      <button
        class="tab-btn"
        :class="{ active: activeTab === 'open' }"
        @click="activeTab = 'open'"
      >
        {{ t('common.active') }}
        <span class="tab-count">{{ openCount }}</span>
      </button>

      <button
        class="tab-btn"
        :class="{ active: activeTab === 'resolved' }"
        @click="activeTab = 'resolved'"
      >
        {{ t('repair.statuses.resolved') }}
        <span class="tab-count">{{ resolvedCount }}</span>
      </button>
    </div>

    <div v-if="loading && !requests.length" class="state-card">{{ t('repair.loadingRequests') }}</div>

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
            <div class="meta-row">
              <span class="category-badge">
                {{ getRepairRequestCategoryLabel(item.category) }}
              </span>
              <span class="request-id">#{{ item.id }}</span>
            </div>
            <h2>{{ item.title }}</h2>
          </div>

          <span class="status-badge" :class="getStatusClass(item.status)">
            {{ getRepairRequestStatusLabel(item.status) }}
          </span>
        </div>

        <p class="description">{{ item.description }}</p>

        <div class="details-grid">
          <div class="detail-card">
            <span class="detail-label">{{ t('common.room') }}</span>
            <span class="detail-value">{{ getRoomLabel(item) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">{{ t('common.address') }}</span>
            <span class="detail-value">{{ getAddress(item) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">{{ t('repair.createdAt') }}</span>
            <span class="detail-value">{{ formatDate(item.created_at) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">{{ t('common.updatedAt') }}</span>
            <span class="detail-value">{{ formatDate(item.updated_at) }}</span>
          </div>
        </div>

        <div v-if="item.handled_by" class="comment-box">
          <span class="detail-label">{{ t('repair.employee') }}</span>
          <span class="detail-value">{{ item.handled_by.full_name || item.handled_by.email }}</span>
        </div>

        <div v-if="item.employee_comment" class="comment-box">
          <span class="detail-label">{{ t('repair.employeeComment') }}</span>
          <span class="detail-value">{{ item.employee_comment }}</span>
        </div>

        <div v-if="item.attachments.length" class="attachments">
          <span class="detail-label">{{ t('common.photos') }}</span>
          <div class="attachment-list">
            <a
              v-for="attachment in item.attachments"
              :key="attachment.id"
              :href="resolveRepairRequestAssetUrl(attachment.url || attachment.file_path) || '#'"
              class="attachment-chip"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t('repair.photo', { id: attachment.id }) }}
            </a>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.repairs-page {
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
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.16), transparent 28%),
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
  max-width: 780px;
  margin: 12px 0 0;
  line-height: 1.6;
  color: #526075;
}

.refresh-btn,
.primary-btn {
  min-height: 48px;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.refresh-btn {
  min-width: 148px;
  padding: 12px 18px;
  background: #172033;
  color: #fff;
}

.primary-btn {
  width: 100%;
  padding: 12px 18px;
  background: #2563eb;
  color: #fff;
}

.refresh-btn:disabled,
.primary-btn:disabled {
  cursor: wait;
  opacity: 0.72;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card,
.form-card,
.info-card,
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

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 18px;
}

.form-card,
.info-card,
.request-card {
  padding: 24px;
  border-radius: 28px;
}

.form-card h2,
.info-card h2,
.request-top h2 {
  margin: 0 0 16px;
  font-size: 24px;
  line-height: 1.15;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.field-label,
.detail-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7a8799;
}

.field-input {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid #d1d9e6;
  border-radius: 14px;
  background: #fff;
  font-size: 15px;
  color: #172033;
}

.field-input--textarea {
  min-height: 136px;
  padding: 14px;
  resize: vertical;
}

.field-input--file {
  padding: 10px 14px;
}

.notice {
  margin-bottom: 14px;
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

.steps-list {
  margin: 0;
  padding-left: 20px;
  color: #475569;
  line-height: 1.7;
}

.files-box,
.comment-box {
  margin-bottom: 14px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #e2ebf5;
}

.file-list,
.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.file-chip,
.attachment-chip,
.category-badge {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  font-weight: 600;
}

.file-chip {
  background: #eef4ff;
  color: #1d4ed8;
}

.attachment-chip {
  background: #eef4ff;
  color: #1d4ed8;
  text-decoration: none;
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
  gap: 18px;
}

.request-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.category-badge {
  background: #eef4ff;
  color: #1d4ed8;
}

.request-id {
  color: #718096;
  font-weight: 600;
}

.status-badge {
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status-badge.pending {
  background: #fff7ed;
  color: #c2410c;
}

.status-badge.inprogress {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-badge.resolved {
  background: #ecfdf3;
  color: #166534;
}

.description {
  margin: 0 0 18px;
  color: #334155;
  line-height: 1.6;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.detail-card {
  padding: 16px 18px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid #e2ebf5;
}

.detail-value {
  color: #172033;
  line-height: 1.5;
}

.attachments {
  margin-top: 18px;
}

@media (max-width: 1100px) {
  .content-grid,
  .stats,
  .details-grid {
    grid-template-columns: 1fr;
  }

  .hero,
  .request-top {
    flex-direction: column;
  }
}

@media (max-width: 700px) {
  .repairs-page {
    padding-top: 56px;
  }

  .hero,
  .form-card,
  .info-card,
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

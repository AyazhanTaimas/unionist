<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getManagedRepairRequests,
  getRepairRequestCategoryLabel,
  getRepairRequestStatusLabel,
  resolveRepairRequest,
  resolveRepairRequestAssetUrl,
  startRepairRequest,
  type RepairRequestItem,
  type RepairRequestStatus,
} from '@/api/repairRequests'

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'resolved'

const requests = ref<RepairRequestItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const search = ref('')
const statusFilter = ref<FilterStatus>('all')
const actionKey = ref<string | null>(null)

const filteredRequests = computed(() => {
  const query = search.value.trim().toLowerCase()

  return requests.value.filter((item) => {
    const matchesStatus = statusFilter.value === 'all' || item.status === statusFilter.value
    if (!matchesStatus) return false
    if (!query) return true

    const searchable = [
      item.title,
      item.description,
      item.student?.full_name,
      item.student?.email,
      item.student?.uni_id,
      item.room?.room_number,
      item.room?.floor?.building?.name,
      item.room?.floor?.building?.address,
      item.category,
      item.status,
      item.employee_comment,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(query)
  })
})

const stats = computed(() => ({
  total: requests.value.length,
  pending: requests.value.filter((item) => item.status === 'pending').length,
  inProgress: requests.value.filter((item) => item.status === 'in_progress').length,
  resolved: requests.value.filter((item) => item.status === 'resolved').length,
}))

const fetchRequests = async () => {
  loading.value = true
  error.value = null

  try {
    requests.value = await getManagedRepairRequests()
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || 'Не удалось загрузить заявки на ремонт'
    requests.value = []
  } finally {
    loading.value = false
  }
}

const formatDate = (value: string | null) => {
  if (!value) return 'Дата неизвестна'

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

const getStatusClass = (status: RepairRequestStatus) => ({
  pending: status === 'pending',
  inprogress: status === 'in_progress',
  resolved: status === 'resolved',
})

const getRoomLabel = (item: RepairRequestItem) => {
  const room = item.room
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

const getAddress = (item: RepairRequestItem) =>
  item.room?.floor?.building?.address || 'Не указан'

const isActing = (key: string) => actionKey.value === key

const takeInWork = async (item: RepairRequestItem) => {
  const confirmed = window.confirm(`Взять заявку "${item.title}" в работу?`)
  if (!confirmed) return

  actionKey.value = `start-${item.id}`
  error.value = null
  notice.value = null

  try {
    const response = await startRepairRequest(item.id)
    notice.value = response.message
    await fetchRequests()
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || 'Не удалось взять заявку в работу'
  } finally {
    actionKey.value = null
  }
}

const markResolved = async (item: RepairRequestItem) => {
  const comment = window.prompt(
    'Комментарий по выполненной работе (необязательно)',
    item.employee_comment || ''
  )

  if (comment === null) return

  actionKey.value = `resolve-${item.id}`
  error.value = null
  notice.value = null

  try {
    const response = await resolveRepairRequest(item.id, comment.trim() || undefined)
    notice.value = response.message
    await fetchRequests()
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || 'Не удалось закрыть заявку'
  } finally {
    actionKey.value = null
  }
}

onMounted(fetchRequests)
</script>

<template>
  <section class="repairs-page">
    <div class="hero">
      <div>
        <p class="eyebrow">Employee / Repairs</p>
        <h1>Заявки на ремонт</h1>
        <p class="subtitle">
          Здесь сотрудник общежития получает заявки от студентов, берёт их в
          работу и отмечает после устранения проблемы.
        </p>
      </div>

      <button class="secondary-btn" :disabled="loading" @click="fetchRequests">
        {{ loading ? 'Обновление...' : 'Обновить' }}
      </button>
    </div>

    <div class="stats">
      <article class="stat-card">
        <span>Всего заявок</span>
        <strong>{{ stats.total }}</strong>
      </article>

      <article class="stat-card warning">
        <span>Новые</span>
        <strong>{{ stats.pending }}</strong>
      </article>

      <article class="stat-card info">
        <span>В работе</span>
        <strong>{{ stats.inProgress }}</strong>
      </article>

      <article class="stat-card success">
        <span>Исправлено</span>
        <strong>{{ stats.resolved }}</strong>
      </article>
    </div>

    <div class="toolbar">
      <input
        v-model="search"
        class="search-input"
        type="search"
        placeholder="Поиск по студенту, комнате или описанию"
      />

      <select v-model="statusFilter" class="filter-select">
        <option value="all">Все статусы</option>
        <option value="pending">Новые</option>
        <option value="in_progress">В работе</option>
        <option value="resolved">Исправлено</option>
      </select>
    </div>

    <div v-if="notice" class="notice success">{{ notice }}</div>
    <div v-if="error" class="notice error">{{ error }}</div>

    <div v-if="loading && !requests.length" class="state-card">
      Загрузка заявок...
    </div>

    <div v-else-if="!filteredRequests.length" class="state-card">
      По текущим фильтрам заявок не найдено.
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
            <p class="student-row">
              {{ item.student?.full_name || 'Студент не найден' }}
              <span class="dot">•</span>
              {{ item.student?.email || 'Без email' }}
            </p>
          </div>

          <span class="status-badge" :class="getStatusClass(item.status)">
            {{ getRepairRequestStatusLabel(item.status) }}
          </span>
        </div>

        <p class="description">{{ item.description }}</p>

        <div class="details-grid">
          <div class="detail-card">
            <span class="detail-label">Комната</span>
            <span class="detail-value">{{ getRoomLabel(item) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">Адрес</span>
            <span class="detail-value">{{ getAddress(item) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">Создана</span>
            <span class="detail-value">{{ formatDate(item.created_at) }}</span>
          </div>

          <div class="detail-card">
            <span class="detail-label">Исполнитель</span>
            <span class="detail-value">
              {{ item.handled_by?.full_name || item.handled_by?.email || 'Пока не назначен' }}
            </span>
          </div>
        </div>

        <div v-if="item.employee_comment" class="comment-box">
          <span class="detail-label">Комментарий сотрудника</span>
          <span class="detail-value">{{ item.employee_comment }}</span>
        </div>

        <div v-if="item.attachments.length" class="attachments">
          <span class="detail-label">Фото от студента</span>
          <div class="attachment-list">
            <a
              v-for="attachment in item.attachments"
              :key="attachment.id"
              :href="resolveRepairRequestAssetUrl(attachment.url || attachment.file_path) || '#'"
              class="attachment-chip"
              target="_blank"
              rel="noopener noreferrer"
            >
              Фото {{ attachment.id }}
            </a>
          </div>
        </div>

        <div v-if="item.status !== 'resolved'" class="actions">
          <button
            v-if="item.status === 'pending'"
            class="action-btn work"
            :disabled="isActing(`start-${item.id}`) || isActing(`resolve-${item.id}`)"
            @click="takeInWork(item)"
          >
            {{ isActing(`start-${item.id}`) ? 'Назначение...' : 'Взять в работу' }}
          </button>

          <button
            class="action-btn resolve"
            :disabled="isActing(`start-${item.id}`) || isActing(`resolve-${item.id}`)"
            @click="markResolved(item)"
          >
            {{ isActing(`resolve-${item.id}`) ? 'Закрытие...' : 'Отметить как исправлено' }}
          </button>
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
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.14), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #eefaf5 100%);
  border: 1px solid #dbe5f0;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #059669;
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

.secondary-btn {
  min-width: 148px;
  min-height: 48px;
  padding: 12px 18px;
  border: none;
  border-radius: 16px;
  background: #172033;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.secondary-btn:disabled {
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

.stat-card.warning {
  background: linear-gradient(135deg, #fff8ef 0%, #ffffff 100%);
}

.stat-card.info {
  background: linear-gradient(135deg, #eef6ff 0%, #ffffff 100%);
}

.stat-card.success {
  background: linear-gradient(135deg, #effcf4 0%, #ffffff 100%);
}

.toolbar {
  display: flex;
  gap: 12px;
}

.search-input,
.filter-select {
  min-height: 48px;
  border-radius: 14px;
  border: 1px solid #d1d9e6;
  background: #fff;
  color: #172033;
  font-size: 15px;
}

.search-input {
  flex: 1;
  padding: 0 16px;
}

.filter-select {
  min-width: 220px;
  padding: 0 14px;
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

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eefdf5;
  color: #059669;
  font-weight: 700;
}

.request-id {
  color: #718096;
  font-weight: 600;
}

.request-top h2 {
  margin: 0 0 8px;
  font-size: 24px;
  line-height: 1.15;
}

.student-row {
  margin: 0;
  color: #68768b;
  line-height: 1.5;
}

.dot {
  margin: 0 8px;
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
  margin: 16px 0 18px;
  color: #334155;
  line-height: 1.6;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.detail-card,
.comment-box {
  padding: 16px 18px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid #e2ebf5;
}

.comment-box {
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

.attachments {
  margin-top: 18px;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.attachment-chip {
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

.actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-btn {
  min-width: 160px;
  min-height: 46px;
  padding: 12px 18px;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.action-btn:disabled {
  cursor: wait;
  opacity: 0.7;
}

.action-btn.work {
  background: #dbeafe;
  color: #1d4ed8;
}

.action-btn.resolve {
  background: #dcfce7;
  color: #166534;
}

@media (max-width: 1100px) {
  .stats,
  .details-grid {
    grid-template-columns: 1fr;
  }

  .hero,
  .toolbar,
  .request-top {
    flex-direction: column;
  }

  .filter-select,
  .search-input,
  .secondary-btn {
    width: 100%;
  }
}

@media (max-width: 700px) {
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

  .action-btn {
    width: 100%;
  }

  .dot {
    display: none;
  }
}
</style>

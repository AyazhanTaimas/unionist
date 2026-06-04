<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getDateLocale, useI18n } from '@/app/i18n'
import { getEmployeeStudents, type EmployeeStudent } from './api'

const { t } = useI18n()

const students = ref<EmployeeStudent[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')

const filteredStudents = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return students.value

  return students.value.filter((student) => {
    const searchable = [
      getFullName(student),
      student.email,
      student.phone_number,
      student.uni_id,
      student.gender,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(query)
  })
})

const stats = computed(() => ({
  total: students.value.length,
  withPhone: students.value.filter((student) => Boolean(student.phone_number)).length,
  male: students.value.filter((student) => student.gender === 'male').length,
  female: students.value.filter((student) => student.gender === 'female').length,
}))

const fetchStudents = async () => {
  loading.value = true
  error.value = null

  try {
    students.value = await getEmployeeStudents()
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || t('pages.employeeStudents.loadError')
    students.value = []
  } finally {
    loading.value = false
  }
}

const getFullName = (student: EmployeeStudent) => {
  const fullName = [student.lastname, student.name, student.middlename]
    .filter(Boolean)
    .join(' ')

  return fullName || student.email || t('common.noName')
}

const getInitials = (student: EmployeeStudent) =>
  getFullName(student)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')

const getGenderLabel = (gender: string | null) => {
  if (gender === 'male') return t('pages.employeeStudents.genders.male')
  if (gender === 'female') return t('pages.employeeStudents.genders.female')

  return t('common.notSpecified')
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

onMounted(fetchStudents)
</script>

<template>
  <section class="students-page">
    <div class="hero">
      <div>
        <p class="eyebrow">{{ t('pages.employeeStudents.eyebrow') }}</p>
        <h1>{{ t('pages.employeeStudents.title') }}</h1>
        <p class="subtitle">
          {{ t('pages.employeeStudents.subtitle') }}
        </p>
      </div>

      <button class="refresh-btn" :disabled="loading" @click="fetchStudents">
        {{ loading ? t('common.refreshing') : t('common.refresh') }}
      </button>
    </div>

    <div class="stats">
      <article class="stat-card">
        <span>{{ t('pages.employeeStudents.total') }}</span>
        <strong>{{ stats.total }}</strong>
      </article>

      <article class="stat-card">
        <span>{{ t('pages.employeeStudents.withPhone') }}</span>
        <strong>{{ stats.withPhone }}</strong>
      </article>

      <article class="stat-card">
        <span>{{ t('pages.employeeStudents.male') }}</span>
        <strong>{{ stats.male }}</strong>
      </article>

      <article class="stat-card">
        <span>{{ t('pages.employeeStudents.female') }}</span>
        <strong>{{ stats.female }}</strong>
      </article>
    </div>

    <div class="toolbar">
      <input
        v-model="search"
        class="search-input"
        type="search"
        :placeholder="t('pages.employeeStudents.searchPlaceholder')"
      />
    </div>

    <div v-if="error" class="notice error">{{ error }}</div>

    <div v-if="loading && !students.length" class="state-card">
      {{ t('pages.employeeStudents.loading') }}
    </div>

    <div v-else-if="!filteredStudents.length" class="state-card">
      {{ students.length ? t('pages.employeeStudents.emptyFilter') : t('pages.employeeStudents.empty') }}
    </div>

    <div v-else class="student-grid">
      <article
        v-for="student in filteredStudents"
        :key="student.id"
        class="student-card"
      >
        <div class="student-head">
          <div class="avatar">{{ getInitials(student) }}</div>

          <div>
            <h2>{{ getFullName(student) }}</h2>
            <p>{{ student.email || t('common.noEmail') }}</p>
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <span>{{ t('pages.employeeStudents.universityId') }}</span>
            <strong>{{ student.uni_id || t('common.noId') }}</strong>
          </div>

          <div class="detail-item">
            <span>{{ t('common.phone') }}</span>
            <strong>{{ student.phone_number || t('common.notSpecified') }}</strong>
          </div>

          <div class="detail-item">
            <span>{{ t('pages.employeeStudents.gender') }}</span>
            <strong>{{ getGenderLabel(student.gender) }}</strong>
          </div>

          <div class="detail-item">
            <span>{{ t('pages.employeeStudents.disciplineLimit') }}</span>
            <strong>{{ student.discipline_limit ?? t('common.notSpecified') }}</strong>
          </div>
        </div>

        <div class="footer-row">
          <span>{{ t('pages.employeeStudents.createdAt') }}: {{ formatDate(student.created_at) }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.students-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100%;
  color: #172033;
}

.hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 28px 32px;
  border-radius: 30px;
  border: 1px solid #cfe4d9;
  background:
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.16), transparent 30%),
    linear-gradient(135deg, #ffffff 0%, #f2fbf6 100%);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 10px;
  color: #047857;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.05;
  font-weight: 800;
}

.subtitle {
  margin: 12px 0 0;
  max-width: 720px;
  color: #5c6578;
  line-height: 1.6;
}

.refresh-btn {
  min-width: 148px;
  height: 48px;
  padding: 0 18px;
  border: none;
  border-radius: 16px;
  background: #172033;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
}

.refresh-btn:disabled {
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
.student-card {
  background: #ffffff;
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

.toolbar {
  display: flex;
  gap: 12px;
}

.search-input {
  width: min(520px, 100%);
  height: 50px;
  padding: 0 16px;
  border: 1px solid #dbe5f0;
  border-radius: 16px;
  background: #ffffff;
  color: #172033;
}

.notice,
.state-card {
  padding: 18px;
  border-radius: 18px;
}

.notice.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.state-card {
  color: #526075;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.student-card {
  padding: 20px;
  border-radius: 24px;
}

.student-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: #ecfdf5;
  color: #047857;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.student-head h2 {
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
}

.student-head p {
  margin: 6px 0 0;
  color: #68768b;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.detail-item {
  min-width: 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #e2ebf5;
}

.detail-item span {
  display: block;
  margin-bottom: 8px;
  color: #7a8799;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail-item strong {
  color: #172033;
  overflow-wrap: anywhere;
}

.footer-row {
  margin-top: 16px;
  color: #68768b;
  font-size: 13px;
}

@media (max-width: 1180px) {
  .stats,
  .student-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .hero {
    flex-direction: column;
    padding: 22px;
    border-radius: 24px;
  }

  h1 {
    font-size: 28px;
  }

  .refresh-btn {
    width: 100%;
  }

  .stats,
  .student-grid,
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>

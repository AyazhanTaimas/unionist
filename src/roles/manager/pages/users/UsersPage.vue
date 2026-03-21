<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { deleteUser, getUsers } from './api'
import UserFormModal from './UserFormModal.vue'
import type { ManagerUser } from './types'

const users = ref<ManagerUser[]>([])
const search = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const selectedUser = ref<ManagerUser | null>(null)
const showModal = ref(false)
const deletingUserId = ref<number | null>(null)

const filteredUsers = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) return users.value

  return users.value.filter((user) =>
    [
      user.name,
      user.lastname,
      user.middlename,
      user.email,
      user.uni_id,
      user.phone_number,
      user.role,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query)
  )
})

const stats = computed(() => ({
  total: users.value.length,
  students: users.value.filter((user) => user.role === 'student').length,
  managers: users.value.filter((user) => user.role === 'manager').length,
  staff: users.value.filter((user) => ['admin', 'dorm-admin', 'employee'].includes(user.role)).length,
}))

const fetchUsers = async () => {
  loading.value = true
  error.value = null

  try {
    users.value = await getUsers()
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || 'Не удалось загрузить пользователей'
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  selectedUser.value = null
  showModal.value = true
}

const openEdit = (user: ManagerUser) => {
  selectedUser.value = user
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedUser.value = null
}

const handleSaved = async (message: string) => {
  notice.value = message
  await fetchUsers()
  closeModal()
}

const removeUser = async (user: ManagerUser) => {
  const confirmed = confirm(
    `Удалить пользователя ${user.lastname} ${user.name}?`
  )

  if (!confirmed) return

  deletingUserId.value = user.id
  notice.value = null

  try {
    await deleteUser(user.id)
    notice.value = 'Пользователь удален'
    await fetchUsers()
  } catch (requestError: any) {
    alert(
      requestError?.response?.data?.message || 'Не удалось удалить пользователя'
    )
  } finally {
    deletingUserId.value = null
  }
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

const getFullName = (user: ManagerUser) =>
  [user.lastname, user.name, user.middlename].filter(Boolean).join(' ')

onMounted(fetchUsers)
</script>

<template>
  <section class="users-page">
    <div class="hero">
      <div>
        <p class="eyebrow">Manager / Users</p>
        <h1>Пользователи</h1>
        <p class="description">
          Управление учетными записями общежития: список, создание, редактирование
          и удаление пользователей.
        </p>
      </div>

      <div class="hero-actions">
        <button class="secondary-btn" :disabled="loading" @click="fetchUsers">
          {{ loading ? 'Обновление...' : 'Обновить' }}
        </button>

        <button class="primary-btn" @click="openCreate">
          Создать пользователя
        </button>
      </div>
    </div>

    <div class="stats">
      <article class="stat-card">
        <span>Всего</span>
        <strong>{{ stats.total }}</strong>
      </article>

      <article class="stat-card">
        <span>Студенты</span>
        <strong>{{ stats.students }}</strong>
      </article>

      <article class="stat-card">
        <span>Менеджеры</span>
        <strong>{{ stats.managers }}</strong>
      </article>

      <article class="stat-card">
        <span>Admin / Employee</span>
        <strong>{{ stats.staff }}</strong>
      </article>
    </div>

    <div v-if="notice" class="notice success">{{ notice }}</div>
    <div v-if="error" class="notice error">{{ error }}</div>

    <div class="toolbar">
      <input
        v-model="search"
        class="search-input"
        type="text"
        placeholder="Поиск по имени, email, роли, ID"
      />
    </div>

    <div v-if="loading && !users.length" class="state-card">
      Загрузка пользователей...
    </div>

    <div v-else-if="!filteredUsers.length" class="state-card">
      Пользователи не найдены.
    </div>

    <div v-else class="users-grid">
      <article
        v-for="user in filteredUsers"
        :key="user.id"
        class="user-card"
      >
        <div class="card-top">
          <div>
            <h2>{{ getFullName(user) }}</h2>
            <p class="subline">{{ user.email }}</p>
          </div>

          <span class="role-badge">{{ user.role }}</span>
        </div>

        <div class="details-grid">
          <div class="detail">
            <span>ID</span>
            <strong>{{ user.uni_id }}</strong>
          </div>

          <div class="detail">
            <span>Телефон</span>
            <strong>{{ user.phone_number }}</strong>
          </div>

          <div class="detail">
            <span>Пол</span>
            <strong>{{ user.gender }}</strong>
          </div>

          <div class="detail">
            <span>Лимит дисциплины</span>
            <strong>{{ user.discipline_limit }}</strong>
          </div>
        </div>

        <div class="footer">
          <span class="date-label">Создан: {{ formatDate(user.created_at) }}</span>

          <div class="actions">
            <button class="edit-btn" @click="openEdit(user)">
              Редактировать
            </button>

            <button
              class="delete-btn"
              :disabled="deletingUserId === user.id"
              @click="removeUser(user)"
            >
              {{ deletingUserId === user.id ? 'Удаление...' : 'Удалить' }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <UserFormModal
      v-if="showModal"
      :user="selectedUser"
      @close="closeModal"
      @saved="handleSaved"
    />
  </section>
</template>

<style scoped lang="scss">
.users-page {
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
    radial-gradient(circle at top right, rgba(16, 185, 129, 0.16), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #f3fbf7 100%);
  border: 1px solid #dbe5f0;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #0f766e;
}

h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.05;
  font-weight: 800;
}

.description {
  margin: 12px 0 0;
  max-width: 680px;
  line-height: 1.6;
  color: #526075;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  min-width: 168px;
  height: 48px;
  padding: 0 18px;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
}

.primary-btn {
  background: #172033;
  color: #ffffff;
}

.secondary-btn {
  background: #eef4fb;
  color: #172033;
}

.primary-btn:disabled,
.secondary-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card,
.state-card,
.user-card {
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
}

.search-input {
  width: min(420px, 100%);
  height: 50px;
  padding: 0 16px;
  border: 1px solid #dbe5f0;
  border-radius: 16px;
  background: #ffffff;
  color: #172033;
}

.state-card {
  padding: 24px;
  border-radius: 24px;
  color: #526075;
}

.users-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

.user-card {
  padding: 22px;
  border-radius: 28px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.card-top h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.15;
}

.subline {
  margin: 8px 0 0;
  color: #68768b;
  line-height: 1.5;
}

.role-badge {
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: 999px;
  background: #eef4ff;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.detail {
  padding: 14px 16px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid #e2ebf5;
}

.detail span {
  display: block;
  margin-bottom: 8px;
  color: #7a8799;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.detail strong {
  color: #172033;
  line-height: 1.5;
}

.footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-top: 18px;
}

.date-label {
  color: #68768b;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 10px;
}

.edit-btn,
.delete-btn {
  height: 42px;
  padding: 0 14px;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.edit-btn {
  background: #eef4ff;
  color: #1d4ed8;
}

.delete-btn {
  background: #fee2e2;
  color: #b91c1c;
}

.delete-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 1080px) {
  .stats,
  .users-grid,
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero,
  .footer,
  .card-top {
    flex-direction: column;
  }

  .hero {
    padding: 22px;
    border-radius: 24px;
  }

  h1 {
    font-size: 28px;
  }

  .search-input,
  .primary-btn,
  .secondary-btn {
    width: 100%;
  }

  .hero-actions,
  .actions {
    width: 100%;
  }
}
</style>

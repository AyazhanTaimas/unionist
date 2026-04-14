<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  createBroadcastNotification,
  getBroadcastNotifications,
  type BroadcastNotificationItem,
} from '@/api/notifications'

const notifications = ref<BroadcastNotificationItem[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)

const form = ref({
  title: '',
  message: '',
  action_url: '',
})

const fetchNotifications = async () => {
  loading.value = true
  error.value = null

  try {
    notifications.value = await getBroadcastNotifications()
  } catch (requestError: any) {
    error.value =
      requestError?.response?.data?.message || 'Не удалось загрузить уведомления'
    notifications.value = []
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    message: '',
    action_url: '',
  }
}

const submit = async () => {
  notice.value = null
  error.value = null

  if (!form.value.title.trim() || !form.value.message.trim()) {
    error.value = 'Заполните заголовок и текст уведомления'
    return
  }

  submitting.value = true

  try {
    await createBroadcastNotification({
      title: form.value.title.trim(),
      message: form.value.message.trim(),
      action_url: form.value.action_url.trim() || null,
    })

    notice.value = 'Уведомление отправлено всем пользователям'
    resetForm()
    await fetchNotifications()
    window.dispatchEvent(new Event('app:notifications-refresh'))
  } catch (requestError: any) {
    const responseData = requestError?.response?.data
    error.value =
      responseData?.errors?.message?.[0] ||
      responseData?.errors?.title?.[0] ||
      responseData?.message ||
      'Не удалось отправить уведомление'
  } finally {
    submitting.value = false
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

onMounted(fetchNotifications)
</script>

<template>
  <section class="notifications-page">
    <div class="hero">
      <div>
        <p class="eyebrow">Manager / Notifications</p>
        <h1>Глобальные уведомления</h1>
        <p class="subtitle">
          Менеджер или администратор может отправить короткое уведомление, и оно
          появится у всех пользователей в колокольчике.
        </p>
      </div>

      <button class="refresh-btn" :disabled="loading" @click="fetchNotifications">
        {{ loading ? 'Обновление...' : 'Обновить' }}
      </button>
    </div>

    <div class="content-grid">
      <div class="form-card">
        <h2>Новое уведомление</h2>

        <div v-if="notice" class="notice success">{{ notice }}</div>
        <div v-if="error" class="notice error">{{ error }}</div>

        <label class="field">
          <span class="field-label">Заголовок</span>
          <input
            v-model="form.title"
            class="field-input"
            type="text"
            maxlength="255"
            placeholder="Например: Отключение воды"
          />
        </label>

        <label class="field">
          <span class="field-label">Текст уведомления</span>
          <textarea
            v-model="form.message"
            class="field-input field-input--textarea"
            maxlength="5000"
            placeholder="Напишите короткое уведомление для всех пользователей"
          />
        </label>

        <label class="field">
          <span class="field-label">Ссылка внутри приложения</span>
          <input
            v-model="form.action_url"
            class="field-input"
            type="text"
            maxlength="255"
            placeholder="Например: /news"
          />
        </label>

        <button class="primary-btn" :disabled="submitting" @click="submit">
          {{ submitting ? 'Отправка...' : 'Отправить всем' }}
        </button>
      </div>

      <div class="info-card">
        <h2>Как это работает</h2>
        <ol class="steps-list">
          <li>Менеджер или администратор отправляет уведомление.</li>
          <li>Backend создаёт рассылку и записывает её каждому пользователю.</li>
          <li>Все роли видят уведомление в колокольчике в верхней панели.</li>
        </ol>
      </div>
    </div>

    <div v-if="loading && !notifications.length" class="state-card">
      Загрузка уведомлений...
    </div>

    <div v-else-if="!notifications.length" class="state-card">
      Глобальные уведомления пока не отправлялись.
    </div>

    <div v-else class="notification-list">
      <article
        v-for="item in notifications"
        :key="item.id"
        class="notification-card"
      >
        <div class="notification-top">
          <div>
            <h2>{{ item.title }}</h2>
            <p class="notification-message">{{ item.message }}</p>
          </div>

          <span class="notification-badge">Всем</span>
        </div>

        <div class="meta-grid">
          <div class="meta-card">
            <span class="meta-label">Отправил</span>
            <span class="meta-value">{{ item.sender_name || 'Система' }}</span>
          </div>

          <div class="meta-card">
            <span class="meta-label">Дата</span>
            <span class="meta-value">{{ formatDate(item.created_at) }}</span>
          </div>

          <div class="meta-card">
            <span class="meta-label">Ссылка</span>
            <span class="meta-value">{{ item.action_url || 'Не указана' }}</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.notifications-page {
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
  max-width: 760px;
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

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  gap: 18px;
}

.form-card,
.info-card,
.state-card,
.notification-card {
  background: #fff;
  border: 1px solid #dbe5f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.form-card,
.info-card,
.notification-card {
  border-radius: 28px;
}

.form-card,
.info-card {
  padding: 24px;
}

.form-card h2,
.info-card h2,
.notification-card h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.15;
  font-weight: 800;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.field-label,
.meta-label {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #68768b;
}

.field-input {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid #dbe5f0;
  background: #f8fbff;
  color: #172033;
  font: inherit;
}

.field-input--textarea {
  min-height: 160px;
  resize: vertical;
}

.notice {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
}

.notice.success {
  background: #ecfdf3;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.notice.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.steps-list {
  margin: 16px 0 0;
  padding-left: 20px;
  color: #526075;
  line-height: 1.7;
}

.steps-list li + li {
  margin-top: 10px;
}

.state-card {
  padding: 22px 24px;
  border-radius: 24px;
  color: #526075;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: clamp(320px, 48vh, 560px);
  overflow-y: auto;
  padding-right: 6px;
}

.notification-list::-webkit-scrollbar {
  width: 8px;
}

.notification-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.65);
}

.notification-list::-webkit-scrollbar-track {
  background: transparent;
}

.notification-card {
  padding: 24px;
}

.notification-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.notification-message {
  margin: 14px 0 0;
  max-width: 80ch;
  color: #526075;
  line-height: 1.65;
}

.notification-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.meta-card {
  padding: 16px 18px;
  border-radius: 18px;
  background: #f8fbff;
  border: 1px solid #e2ebf5;
}

.meta-value {
  display: block;
  margin-top: 8px;
  color: #172033;
  line-height: 1.5;
}

@media (max-width: 1100px) {
  .content-grid,
  .meta-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .notifications-page {
    gap: 18px;
    padding-top: 56px;
  }

  .hero {
    flex-direction: column;
    padding: 24px 20px;
    border-radius: 24px;
  }

  h1 {
    font-size: 28px;
  }

  .form-card,
  .info-card,
  .notification-card {
    padding: 20px;
    border-radius: 24px;
  }

  .notification-top {
    flex-direction: column;
  }

  .notification-list {
    max-height: 420px;
    padding-right: 2px;
  }
}
</style>

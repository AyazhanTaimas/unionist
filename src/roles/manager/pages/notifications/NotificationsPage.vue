<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from '@/app/i18n'
import {
  createBroadcastNotification,
  getBroadcastNotifications,
  type BroadcastNotificationItem,
  type NotificationLocale,
} from '@/api/notifications'

const { t, locale, dateLocale } = useI18n()
const locales: Array<{ code: NotificationLocale; label: string }> = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
  { code: 'en', label: 'EN' },
]
const notifications = ref<BroadcastNotificationItem[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const notice = ref<string | null>(null)
const activeLocale = ref<NotificationLocale>('ru')
const activeLocaleLabel = computed(
  () => locales.find((item) => item.code === activeLocale.value)?.label || activeLocale.value.toUpperCase()
)

const form = ref<Record<NotificationLocale, { title: string; message: string }>>({
  ru: { title: '', message: '' },
  kk: { title: '', message: '' },
  en: { title: '', message: '' },
})

const fetchNotifications = async () => {
  loading.value = true
  error.value = null

  try {
    notifications.value = await getBroadcastNotifications()
  } catch (requestError) {
    console.error(requestError)
    error.value = t('pages.managerNotifications.loadError')
    notifications.value = []
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    ru: { title: '', message: '' },
    kk: { title: '', message: '' },
    en: { title: '', message: '' },
  }
  activeLocale.value = 'ru'
}

const submit = async () => {
  notice.value = null
  error.value = null

  const emptyLocale = locales.find(
    (item) =>
      !form.value[item.code].title.trim() ||
      !form.value[item.code].message.trim()
  )

  if (emptyLocale) {
    activeLocale.value = emptyLocale.code
    error.value = t('pages.managerNotifications.validationError', { locale: emptyLocale.label })
    return
  }

  submitting.value = true

  try {
    await createBroadcastNotification({
      title: form.value.ru.title.trim(),
      message: form.value.ru.message.trim(),
      translations: {
        kk: {
          title: form.value.kk.title.trim(),
          message: form.value.kk.message.trim(),
        },
        en: {
          title: form.value.en.title.trim(),
          message: form.value.en.message.trim(),
        },
      },
    })

    notice.value = t('pages.managerNotifications.submitSuccess')
    resetForm()
    await fetchNotifications()
    window.dispatchEvent(new Event('app:notifications-refresh'))
  } catch (requestError) {
    console.error(requestError)
    error.value = t('pages.managerNotifications.submitError')
  } finally {
    submitting.value = false
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

watch(locale, fetchNotifications, { immediate: true })
</script>

<template>
  <section class="notifications-page">
    <div class="hero">
      <div>
        <p class="eyebrow">{{ t('pages.managerNotifications.eyebrow') }}</p>
        <h1>{{ t('pages.managerNotifications.title') }}</h1>
        <p class="subtitle">
          {{ t('pages.managerNotifications.subtitle') }}
        </p>
      </div>

      <button class="refresh-btn" :disabled="loading" @click="fetchNotifications">
        {{ loading ? t('common.refreshing') : t('common.refresh') }}
      </button>
    </div>

    <div class="content-grid">
      <div class="form-card">
        <h2>{{ t('pages.managerNotifications.newTitle') }}</h2>

        <div v-if="notice" class="notice success">{{ notice }}</div>
        <div v-if="error" class="notice error">{{ error }}</div>

        <div class="language-tabs">
          <button
            v-for="item in locales"
            :key="item.code"
            type="button"
            class="language-tab"
            :class="{ active: activeLocale === item.code }"
            @click="activeLocale = item.code"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="language-panel">
          <label class="field">
            <span class="field-label">{{ t('common.title') }} {{ activeLocaleLabel }}</span>
            <input
              v-model="form[activeLocale].title"
              class="field-input"
              type="text"
              maxlength="255"
              :placeholder="t('pages.managerNotifications.titlePlaceholder')"
            />
          </label>

          <label class="field">
            <span class="field-label">
              {{ t('pages.managerNotifications.messageLabel') }} {{ activeLocaleLabel }}
            </span>
            <textarea
              v-model="form[activeLocale].message"
              class="field-input field-input--textarea"
              maxlength="5000"
              :placeholder="t('pages.managerNotifications.messagePlaceholder')"
            />
          </label>
        </div>

        <button class="primary-btn" :disabled="submitting" @click="submit">
          {{ submitting ? t('common.sending') : t('pages.managerNotifications.sendAll') }}
        </button>
      </div>

      <div class="info-card">
        <h2>{{ t('pages.managerNotifications.howItWorks') }}</h2>
        <ol class="steps-list">
          <li>{{ t('pages.managerNotifications.step1') }}</li>
          <li>{{ t('pages.managerNotifications.step2') }}</li>
          <li>{{ t('pages.managerNotifications.step3') }}</li>
        </ol>
      </div>
    </div>

    <div v-if="loading && !notifications.length" class="state-card">
      {{ t('pages.managerNotifications.loading') }}
    </div>

    <div v-else-if="!notifications.length" class="state-card">
      {{ t('pages.managerNotifications.empty') }}
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

          <span class="notification-badge">{{ t('pages.managerNotifications.audienceAll') }}</span>
        </div>

        <div class="meta-grid">
          <div class="meta-card">
            <span class="meta-label">{{ t('pages.managerNotifications.sender') }}</span>
            <span class="meta-value">{{ item.sender_name || t('pages.managerNotifications.system') }}</span>
          </div>

          <div class="meta-card">
            <span class="meta-label">{{ t('common.date') }}</span>
            <span class="meta-value">{{ formatDate(item.created_at) }}</span>
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

.language-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.language-tab {
  min-height: 42px;
  border: 1px solid #dbe5f0;
  border-radius: 14px;
  background: #f8fbff;
  color: #526075;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.language-tab.active {
  border-color: #2563eb;
  background: #eef4ff;
  color: #2563eb;
}

.language-panel {
  display: flex;
  flex-direction: column;
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
  gap: 14px;
}

.notification-card {
  padding: 18px 20px;
}

.notification-card h2 {
  font-size: 20px;
}

.notification-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.notification-message {
  margin: 10px 0 0;
  max-width: 80ch;
  color: #526075;
  line-height: 1.55;
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.meta-card {
  padding: 12px 14px;
  border-radius: 16px;
  background: #f8fbff;
  border: 1px solid #e2ebf5;
}

.meta-value {
  display: block;
  margin-top: 6px;
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
    gap: 12px;
  }

  .language-tab {
    min-height: 38px;
    border-radius: 12px;
  }
}
</style>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import {
  getInboxNotifications,
  markAllInboxNotificationsRead,
  markInboxNotificationRead,
  type InboxNotificationItem,
} from '@/api/notifications'
import BellIcon from './BellIcon.vue'
import UserIcon from './UserIcon.vue'
import HeaderLogo from './HeaderLogo.vue'
import { useRouter } from 'vue-router'
import { api } from '@/api/instance'
import { resetDormAccessState } from '@/roles/student/shared/lib/dormAccess'
import { useAppShell } from '@/app/providers/layout/useAppShell'

const router = useRouter()
const notifications = ref<InboxNotificationItem[]>([])
const unreadCount = ref(0)
const loadingNotifications = ref(false)
const notificationsOpen = ref(false)
const notificationsRoot = ref<HTMLElement | null>(null)
const { isMobileViewport, toggleSidebar } = useAppShell()

let refreshIntervalId: number | null = null

function goProfile() {
  if (localStorage.getItem('role') !== 'student') {
    return
  }

  router.push({ name: 'profile' })
}

const formatNotificationDate = (value: string | null) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('ru-RU', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fetchNotifications = async () => {
  if (!localStorage.getItem('token')) {
    notifications.value = []
    unreadCount.value = 0
    return
  }

  loadingNotifications.value = true

  try {
    const payload = await getInboxNotifications(8)
    notifications.value = payload.items
    unreadCount.value = payload.unread_count
  } catch (error) {
    console.error(error)
  } finally {
    loadingNotifications.value = false
  }
}

const markAllAsRead = async () => {
  if (!unreadCount.value) return

  try {
    await markAllInboxNotificationsRead()
    const readAt = new Date().toISOString()

    notifications.value = notifications.value.map((item) => ({
      ...item,
      read_at: item.read_at || readAt,
    }))
    unreadCount.value = 0
  } catch (error) {
    console.error(error)
  }
}

const markAsRead = async (item: InboxNotificationItem) => {
  if (item.read_at) return

  try {
    const updated = await markInboxNotificationRead(item.id)

    notifications.value = notifications.value.map((notification) =>
      notification.id === item.id ? updated : notification
    )
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch (error) {
    console.error(error)
  }
}

const handleNotificationClick = async (item: InboxNotificationItem) => {
  await markAsRead(item)

  if (!item.action_url) {
    return
  }

  notificationsOpen.value = false

  if (/^https?:\/\//i.test(item.action_url)) {
    window.open(item.action_url, '_blank', 'noopener')
    return
  }

  await router.push(item.action_url)
}

const toggleNotifications = async () => {
  notificationsOpen.value = !notificationsOpen.value

  if (notificationsOpen.value) {
    await fetchNotifications()
  }
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node | null

  if (!notificationsOpen.value || !notificationsRoot.value || !target) {
    return
  }

  if (!notificationsRoot.value.contains(target)) {
    notificationsOpen.value = false
  }
}

const handleNotificationsRefresh = () => {
  void fetchNotifications()
}

async function logout() {
  try {
    await api.post('/logout')
  } finally {
    localStorage.removeItem('token')
    resetDormAccessState()
    router.push({ name: 'login' })
  }
}

onMounted(() => {
  void fetchNotifications()

  refreshIntervalId = window.setInterval(() => {
    void fetchNotifications()
  }, 60000)

  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('app:notifications-refresh', handleNotificationsRefresh)
})

onUnmounted(() => {
  if (refreshIntervalId !== null) {
    window.clearInterval(refreshIntervalId)
  }

  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('app:notifications-refresh', handleNotificationsRefresh)
})
</script>

<template>
  <header class="header">
    <div class="header-start">
      <button
        v-if="isMobileViewport"
        class="menu-toggle"
        type="button"
        aria-label="Открыть меню"
        @click="toggleSidebar"
      >
        <span />
        <span />
        <span />
      </button>

      <div v-if="isMobileViewport" class="mobile-brand">
        <HeaderLogo />
      </div>
    </div>

    <div class="actions">
      <div ref="notificationsRoot" class="notifications-wrap">
        <button class="icon-btn" @click="toggleNotifications">
          <BellIcon />
          <span v-if="unreadCount" class="notification-counter">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <div v-if="notificationsOpen" class="notifications-panel">
          <div class="notifications-header">
            <div>
              <strong>Уведомления</strong>
              <span>{{ unreadCount }} непрочитанных</span>
            </div>

            <button
              class="notifications-action"
              :disabled="!unreadCount"
              @click="markAllAsRead"
            >
              Прочитать все
            </button>
          </div>

          <div v-if="loadingNotifications" class="notifications-state">
            Загрузка...
          </div>

          <div v-else-if="!notifications.length" class="notifications-state">
            Новых уведомлений пока нет.
          </div>

          <div v-else class="notifications-list">
            <button
              v-for="item in notifications"
              :key="item.id"
              class="notification-item"
              :class="{ unread: !item.read_at }"
              @click="handleNotificationClick(item)"
            >
              <div class="notification-item__top">
                <strong>{{ item.title }}</strong>
                <span>{{ formatNotificationDate(item.created_at) }}</span>
              </div>

              <p>{{ item.message }}</p>
            </button>
          </div>
        </div>
      </div>

      <button class="icon-btn"  @click="goProfile">
        <UserIcon />
      </button>

      <button class="logout-btn" @click="logout">
        <img src="@/assets/logout.svg"/>
      </button>
    </div>
  </header>
</template>


<style scoped lang="scss">
.header {
  min-height: 64px;
  padding: 0 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: transparent;
}

.header-start {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.icon-btn,
.logout-btn,
.menu-toggle {
  position: relative;
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
  background: transparent;
  border: none;
  cursor: pointer;

  color: #4f46e5;
  transition: background 0.2s;

  &:hover {
    background: #eef2ff;
  }

  svg {
    width: 22px;
    height: 22px;
  }
}

.menu-toggle {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
}

.menu-toggle span {
  width: 16px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.mobile-brand :deep(img) {
  height: 34px;
}

.notifications-wrap {
  position: relative;
}

.notification-counter {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.notifications-panel {
  position: absolute;
  top: 46px;
  right: 0;
  width: min(360px, calc(100vw - 48px));
  padding: 14px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #dbe5f0;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
  z-index: 20;
}

.notifications-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5edf7;

  strong,
  span {
    display: block;
  }

  strong {
    font-size: 15px;
    color: #172033;
  }

  span {
    margin-top: 4px;
    font-size: 12px;
    color: #68768b;
  }
}

.notifications-action {
  border: none;
  background: transparent;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.notifications-action:disabled {
  cursor: default;
  opacity: 0.45;
}

.notifications-state {
  padding: 16px 4px 8px;
  color: #68768b;
  font-size: 14px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 420px;
  margin-top: 12px;
  overflow-y: auto;
}

.notification-item {
  width: 100%;
  border: 1px solid #e2ebf5;
  border-radius: 16px;
  background: #f8fbff;
  padding: 14px;
  text-align: left;
  cursor: pointer;
}

.notification-item.unread {
  border-color: #c7d7f8;
  background: #eef4ff;
}

.notification-item__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.notification-item__top strong {
  color: #172033;
  font-size: 14px;
  line-height: 1.35;
}

.notification-item__top span,
.notification-item p {
  color: #68768b;
  font-size: 12px;
}

.notification-item p {
  margin: 8px 0 0;
  color: #526075;
  font-size: 13px;
  line-height: 1.55;
}

.logout-btn {
  padding: 0;
  color: #4f46e5;
}

.logout-btn img {
  width: 22px;
  height: 22px;
}

.logout-btn:hover {
  background: #eef2ff;
}

@media (max-width: 700px) {
  .header {
    padding: 8px 12px 0;
  }

  .actions {
    gap: 10px;
  }

  .notifications-panel {
    position: fixed;
    top: 74px;
    left: 12px;
    right: 12px;
    width: auto;
    max-width: none;
  }

  .notifications-header {
    flex-wrap: wrap;
  }

  .notification-item__top {
    flex-direction: column;
  }
}

@media (max-width: 520px) {
  .mobile-brand :deep(img) {
    height: 28px;
  }

  .actions {
    gap: 8px;
  }
}

</style>

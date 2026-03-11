<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getProfile, updateProfile, resetPassword } from './profileApi'
import type { User } from '../types'

const profile = ref<User | null>(null)
const loading = ref(true)
const saving = ref(false)
const toast = ref<string | null>(null)
const showPasswordModal = ref(false)
const passwordSaving = ref(false)
const passwordError = ref<string | null>(null)

const form = ref({
  name: '',
  lastname: '',
  middlename: '',
  phone_number: ''
})

const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const MIN_PASSWORD_LEN = 8

const fullName = computed(() => {
  if (!profile.value) return ''
  return `${profile.value.name} ${profile.value.lastname} ${profile.value.middlename ?? ''}`
})

const showToast = (msg: string) => {
  toast.value = msg
  setTimeout(() => (toast.value = null), 2000)
}

const resetPasswordForm = () => {
  passwordForm.value.old_password = ''
  passwordForm.value.new_password = ''
  passwordForm.value.confirm_password = ''
  passwordError.value = null
}

onMounted(async () => {
  try {
    profile.value = await getProfile()

    form.value.name = profile.value.name
    form.value.lastname = profile.value.lastname
    form.value.middlename = profile.value.middlename
    form.value.phone_number = profile.value.phone_number
  } finally {
    loading.value = false
  }
})

const save = async () => {
  if (!profile.value) return
  saving.value = true

  try {
    await updateProfile(form.value)
    showToast('Сохранено ✅')
  } finally {
    saving.value = false
  }
}

const openPasswordModal = () => {
  resetPasswordForm()
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  resetPasswordForm()
  showPasswordModal.value = false
}

const validatePasswordForm = (): string | null => {
  if (!passwordForm.value.old_password) return 'Введите старый пароль'
  if (!passwordForm.value.new_password) return 'Введите новый пароль'
  if (passwordForm.value.new_password.length < MIN_PASSWORD_LEN) {
    return `Минимальная длина пароля — ${MIN_PASSWORD_LEN} символов`
  }
  if (!passwordForm.value.confirm_password) {
    return 'Повторите новый пароль'
  }
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    return 'Пароли не совпадают'
  }
  return null
}

const savePassword = async () => {
  const validationError = validatePasswordForm()
  if (validationError) {
    passwordError.value = validationError
    return
  }

  passwordSaving.value = true
  try {
    passwordError.value = null
    await resetPassword(passwordForm.value)
    showToast('Пароль изменён ✅')
    resetPasswordForm()
    closePasswordModal()
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Не удалось изменить пароль'
    passwordError.value = message
  } finally {
    passwordSaving.value = false
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (!showPasswordModal.value) return
  if (event.key === 'Escape') closePasswordModal()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="page">
    <div v-if="loading" class="loader">Загрузка...</div>

    <div v-else class="card">
      <h2 class="title">Личная информация</h2>

      <!-- Верхняя часть -->
      <div class="top">
        <div class="avatar">
          <div class="avatar__placeholder">
            {{ profile?.name?.charAt(0) }}
          </div>
        </div>

        <div class="name-block">
          <div class="name">{{ fullName }}</div>
          <div class="email">{{ profile?.email }}</div>
          <div class="role">{{ profile?.role }}</div>
        </div>
      </div>

      <!-- Форма -->
      <div class="grid">
        <label class="field">
          <span>ID (Uni ID)</span>
          <input :value="profile?.uni_id" disabled />
        </label>

        <label class="field">
          <span>Телефон</span>
          <input v-model="form.phone_number" />
        </label>

        <label class="field">
          <span>Email</span>
          <input :value="profile?.email" disabled />
        </label>

        <label class="field">
          <span>Пол</span>
          <input :value="profile?.gender" disabled />
        </label>

        <label class="field">
          <span>Пароль</span>
          <input
            type="password"
            placeholder="********"
            readonly
            @click="openPasswordModal"
          />
        </label>
      </div>

      <!-- Кнопка -->
      <div class="actions">
        <button class="btn secondary" type="button" @click="openPasswordModal">
          Сменить пароль
        </button>
        <button
          class="btn primary"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Сохранение…' : 'Сохранить изменения' }}
        </button>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="toast">
      {{ toast }}
    </div>

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="closePasswordModal">
      <div class="modal">
        <div class="modal__accent"></div>
        <div class="modal__content">
          <label class="modal-field">
            <span>Старый пароль</span>
            <input v-model="passwordForm.old_password" type="password" autocomplete="current-password" />
          </label>

          <label class="modal-field">
            <span>Новый пароль</span>
            <input v-model="passwordForm.new_password" type="password" autocomplete="new-password" />
          </label>

          <label class="modal-field">
            <span>Повторите новый пароль</span>
            <input v-model="passwordForm.confirm_password" type="password" autocomplete="new-password" />
          </label>

          <div v-if="passwordError" class="modal-error">
            {{ passwordError }}
          </div>

          <div class="modal-actions">
            <button
              class="btn primary"
              :disabled="passwordSaving"
              @click="savePassword"
            >
              {{ passwordSaving ? 'Сохранение…' : 'Сохранить' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page {
  padding: 32px;
  background: #f6f7fb;
}

.loader {
  text-align: center;
  font-size: 18px;
}

.card {
  background: #ffffff;
  border-radius: 32px;
  padding: 28px 32px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
}

.title {
  margin-bottom: 24px;
  font-size: 32px;
  font-weight: 800;
  font-family: 'Montserrat', sans-serif;
}

.top {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 24px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: #eef2ff;
  display: grid;
  place-items: center;
}

.avatar__placeholder {
  font-size: 32px;
  font-weight: 800;
  color: #3f2bff;
}

.name-block .name {
  font-size: 22px;
  font-weight: 800;
}

.name-block .email {
  color: #64748b;
  margin-top: 4px;
}

.name-block .role {
  margin-top: 6px;
  font-size: 13px;
  color: #3f2bff;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 24px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field span {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.field input {
  height: 48px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 0 14px;
  font-size: 15px;
}

.field input:disabled,
.field input[readonly] {
  background: #f8fafc;
  color: #94a3b8;
}

.field input[readonly] {
  cursor: pointer;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 26px;
}

.btn {
  height: 48px;
  padding: 0 28px;
  border-radius: 999px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.btn.primary {
  background: linear-gradient(180deg, #5b5bff, #3f2bff);
  color: #fff;
  min-width: 260px;
}

.btn.secondary {
  background: #696b71;
  color: #ffffff;
  min-width: 260px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.25);
  display: grid;
  place-items: center;
  z-index: 50;
}

.modal {
  position: relative;
  width: min(560px, 92vw);
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.modal__accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: linear-gradient(180deg, #5b5bff, #3f2bff);
}

.modal__content {
  padding: 28px 32px 30px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-field span {
  font-size: 22px;
  font-weight: 800;
}

.modal-field input {
  height: 48px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  padding: 0 14px;
  font-size: 16px;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.08);
}

.modal-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.modal-error {
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  padding: 14px 18px;
  background: rgba(15, 23, 42, 0.92);
  color: #fff;
  border-radius: 14px;
  font-weight: 600;
}
</style>

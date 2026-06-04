<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { createUser, updateUser } from './api'
import type { ManagerUser, ManagerUserPayload } from './types'
import { useI18n } from '@/app/i18n'

const props = defineProps<{
  user?: ManagerUser | null
}>()

const emit = defineEmits<{
  close: []
  saved: [message: string]
}>()

const { t } = useI18n()
const loading = ref(false)
const error = ref<string | null>(null)
const roleOptions = ['student', 'manager', 'dorm-admin', 'employee', 'admin']
const genderOptions = ['male', 'female']

const form = reactive<ManagerUserPayload>({
  role: 'student',
  email: '',
  password: '',
  phone_number: '',
  lastname: '',
  name: '',
  middlename: '',
  uni_id: '',
  gender: 'male',
  discipline_limit: 10,
})

const isEditing = computed(() => Boolean(props.user))

const title = computed(() =>
  isEditing.value ? t('pages.managerUsers.editTitle') : t('pages.managerUsers.createTitle')
)

const submitLabel = computed(() => {
  if (loading.value) {
    return isEditing.value ? t('pages.managerUsers.saving') : t('pages.managerUsers.creating')
  }

  return isEditing.value ? t('pages.managerUsers.saveSubmit') : t('pages.managerUsers.createSubmit')
})

const resetForm = (user?: ManagerUser | null) => {
  form.role = user?.role || 'student'
  form.email = user?.email || ''
  form.password = ''
  form.phone_number = user?.phone_number || ''
  form.lastname = user?.lastname || ''
  form.name = user?.name || ''
  form.middlename = user?.middlename || ''
  form.uni_id = user?.uni_id || ''
  form.gender = user?.gender || 'male'
  form.discipline_limit = user?.discipline_limit ?? 10
  error.value = null
}

watch(
  () => props.user,
  (user) => {
    resetForm(user)
  },
  { immediate: true }
)

const getApiErrorMessage = (requestError: any, fallback: string) => {
  const message = requestError?.response?.data?.message
  const validationErrors = requestError?.response?.data?.errors

  if (validationErrors && typeof validationErrors === 'object') {
    for (const fieldErrors of Object.values(validationErrors)) {
      if (Array.isArray(fieldErrors) && fieldErrors.length) {
        return String(fieldErrors[0])
      }
    }

    return fallback
  }

  return message || fallback
}

const getRoleLabel = (role: string) => {
  const key = role === 'dorm-admin' ? 'dormAdmin' : role
  const label = t(`pages.managerUsers.roles.${key}`)

  return label === `pages.managerUsers.roles.${key}` ? role : label
}

const getGenderLabel = (gender: string) => {
  const label = t(`pages.managerUsers.genders.${gender}`)

  return label === `pages.managerUsers.genders.${gender}` ? gender : label
}

const submit = async () => {
  error.value = null
  loading.value = true

  try {
    const payload: ManagerUserPayload = {
      role: form.role,
      email: form.email.trim(),
      phone_number: form.phone_number.trim(),
      lastname: form.lastname.trim(),
      name: form.name.trim(),
      middlename: form.middlename.trim(),
      uni_id: form.uni_id.trim(),
      gender: form.gender,
      discipline_limit: Number(form.discipline_limit) || 0,
    }

    if (form.password?.trim()) {
      payload.password = form.password.trim()
    }

    if (!isEditing.value && !payload.password) {
      error.value = t('pages.managerUsers.passwordRequired')
      return
    }

    if (props.user) {
      await updateUser(props.user.id, payload)
      emit('saved', t('pages.managerUsers.updateSuccess'))
    } else {
      await createUser(payload)
      emit('saved', t('pages.managerUsers.createSuccess'))
    }
  } catch (requestError: any) {
    error.value = getApiErrorMessage(
      requestError,
      isEditing.value
        ? t('pages.managerUsers.updateError')
        : t('pages.managerUsers.createError')
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="header">
        <div>
          <p class="eyebrow">{{ t('pages.managerUsers.eyebrow') }}</p>
          <h2>{{ title }}</h2>
        </div>

        <button class="close-btn" :aria-label="t('common.closeMenu')" @click="$emit('close')">×</button>
      </div>

      <div v-if="error" class="error-box">{{ error }}</div>

      <div class="grid">
        <label class="field">
          <span>{{ t('common.name') }}</span>
          <input v-model="form.name" :placeholder="t('common.name')" />
        </label>

        <label class="field">
          <span>{{ t('pages.managerUsers.lastname') }}</span>
          <input v-model="form.lastname" :placeholder="t('pages.managerUsers.lastname')" />
        </label>

        <label class="field">
          <span>{{ t('pages.managerUsers.middlename') }}</span>
          <input v-model="form.middlename" :placeholder="t('pages.managerUsers.middlename')" />
        </label>

        <label class="field">
          <span>{{ t('common.email') }}</span>
          <input v-model="form.email" type="email" placeholder="email@example.com" />
        </label>

        <label class="field">
          <span>{{ t('common.phone') }}</span>
          <input v-model="form.phone_number" placeholder="+77770000000" />
        </label>

        <label class="field">
          <span>{{ t('pages.managerUsers.universityId') }}</span>
          <input v-model="form.uni_id" placeholder="U12345" />
        </label>

        <label class="field">
          <span>{{ t('pages.managerUsers.role') }}</span>
          <select v-model="form.role">
            <option v-for="role in roleOptions" :key="role" :value="role">
              {{ getRoleLabel(role) }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>{{ t('pages.managerUsers.gender') }}</span>
          <select v-model="form.gender">
            <option v-for="gender in genderOptions" :key="gender" :value="gender">
              {{ getGenderLabel(gender) }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>{{ t('pages.managerUsers.disciplineLimit') }}</span>
          <input
            v-model.number="form.discipline_limit"
            type="number"
            min="0"
            placeholder="10"
          />
        </label>

        <label class="field">
          <span>{{ isEditing ? t('pages.managerUsers.newPassword') : t('common.password') }}</span>
          <input
            v-model="form.password"
            type="password"
            :placeholder="isEditing ? t('pages.managerUsers.passwordEditPlaceholder') : t('pages.managerUsers.passwordPlaceholder')"
          />
        </label>
      </div>

      <div class="actions">
        <button class="submit-btn" :disabled="loading" @click="submit">
          {{ submitLabel }}
        </button>

        <button class="secondary-btn" :disabled="loading" @click="$emit('close')">
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.48);
}

.modal {
  width: min(820px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 28px;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid #dbe5f0;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2563eb;
}

h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
  color: #172033;
}

.close-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 12px;
  background: #eef4fb;
  color: #172033;
  font-size: 24px;
  cursor: pointer;
}

.error-box {
  margin-top: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field span {
  font-size: 13px;
  font-weight: 700;
  color: #526075;
}

.field input,
.field select {
  height: 48px;
  padding: 0 14px;
  border: 1px solid #dbe5f0;
  border-radius: 14px;
  background: #f8fbff;
  color: #172033;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.submit-btn,
.secondary-btn {
  min-width: 160px;
  height: 48px;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
}

.submit-btn {
  background: #172033;
  color: #ffffff;
}

.secondary-btn {
  background: #eef4fb;
  color: #172033;
}

.submit-btn:disabled,
.secondary-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .submit-btn,
  .secondary-btn {
    width: 100%;
  }
}
</style>

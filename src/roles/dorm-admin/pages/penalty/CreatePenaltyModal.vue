<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  createPenalty,
  getPenaltyRules,
  getPenaltyTargets,
  type PenaltyRule,
  type PenaltyTarget,
} from './api'

const emit = defineEmits<{
  close: []
  created: [message: string]
}>()

const loading = ref(false)
const saving = ref(false)
const loadError = ref<string | null>(null)
const formError = ref<string | null>(null)
const targetQuery = ref('')
const selectedFiles = ref<File[]>([])
const targets = ref<PenaltyTarget[]>([])
const rules = ref<PenaltyRule[]>([])

const form = ref({
  user_id: '',
  rule_id: '',
  points: '',
  description: '',
})

const filteredTargets = computed(() => {
  const query = targetQuery.value.trim().toLowerCase()
  if (!query) return targets.value

  return targets.value.filter((target) => {
    const searchable = [
      target.user?.full_name,
      target.user?.email,
      target.user?.uni_id,
      target.room.label,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(query)
  })
})

const selectedRule = computed(
  () => rules.value.find((rule) => rule.id === Number(form.value.rule_id)) || null
)

const selectedTarget = computed(
  () =>
    targets.value.find((target) => target.user?.id === Number(form.value.user_id)) ||
    null
)

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectedFiles.value = Array.from(input.files || [])
}

const loadOptions = async () => {
  loading.value = true
  loadError.value = null

  try {
    const [loadedTargets, loadedRules] = await Promise.all([
      getPenaltyTargets(),
      getPenaltyRules(),
    ])

    targets.value = loadedTargets
    rules.value = loadedRules
  } catch (requestError: any) {
    loadError.value =
      requestError?.response?.data?.message ||
      'Не удалось загрузить правила и список студентов'
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  formError.value = null

  if (!form.value.user_id) {
    formError.value = 'Выберите студента'
    return
  }

  if (!form.value.rule_id) {
    formError.value = 'Выберите правило штрафа'
    return
  }

  if (form.value.points && Number(form.value.points) <= 0) {
    formError.value = 'Количество баллов должно быть больше нуля'
    return
  }

  saving.value = true

  try {
    const payload = new FormData()
    payload.append('user_id', form.value.user_id)
    payload.append('rule_id', form.value.rule_id)

    if (form.value.points) {
      payload.append('points', form.value.points)
    }

    if (form.value.description.trim()) {
      payload.append('description', form.value.description.trim())
    }

    selectedFiles.value.forEach((file) => {
      payload.append('evidences[]', file)
    })

    const message = await createPenalty(payload)

    emit('created', message)
  } catch (requestError: any) {
    formError.value =
      requestError?.response?.data?.message || 'Не удалось создать штраф'
  } finally {
    saving.value = false
  }
}

onMounted(loadOptions)
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2>Выдать штраф</h2>
          <p>Выберите студента, правило и при необходимости загрузите фото нарушения.</p>
        </div>

        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <div v-if="loading" class="state-box">
        Загрузка формы...
      </div>

      <div v-else-if="loadError" class="state-box state-box--error">
        {{ loadError }}
      </div>

      <div v-else class="form">
        <label>Поиск студента</label>
        <input
          v-model="targetQuery"
          placeholder="Имя, email, Uni ID или комната"
        />

        <label>Студент</label>
        <select v-model="form.user_id">
          <option value="">Выберите студента</option>
          <option
            v-for="target in filteredTargets"
            :key="target.settlement_id"
            :value="target.user?.id || ''"
          >
            {{
              `${target.user?.full_name || 'Без имени'} • ${target.room.label} • ${target.user?.uni_id || 'без ID'}`
            }}
          </option>
        </select>

        <div v-if="selectedTarget" class="selection-note">
          {{ selectedTarget.user?.email }} • {{ selectedTarget.room.label }}
        </div>

        <label>Правило штрафа</label>
        <select v-model="form.rule_id">
          <option value="">Выберите правило</option>
          <option v-for="rule in rules" :key="rule.id" :value="rule.id">
            {{ `${rule.code} • ${rule.title}` }}
          </option>
        </select>

        <div v-if="selectedRule" class="selection-note">
          По умолчанию: {{ selectedRule.default_points }} баллов
          <span v-if="selectedRule.redeemable">• допускает отработку</span>
          <span v-if="selectedRule.creates_financial_charge">
            • создаст финансовое начисление
          </span>
        </div>

        <label>Баллы</label>
        <input
          v-model="form.points"
          type="number"
          min="1"
          placeholder="Оставьте пустым, чтобы взять значение из правила"
        />

        <label>Описание</label>
        <textarea
          v-model="form.description"
          placeholder="Контекст нарушения, обстоятельства, дополнительные детали"
        />

        <label>Фото / доказательства</label>
        <input
          type="file"
          accept="image/*"
          multiple
          @change="handleFileChange"
        />

        <p class="helper-text">
          Можно прикрепить несколько изображений. Файлы будут загружены в backend,
          а в БД сохранится путь к каждому изображению.
        </p>

        <div v-if="selectedFiles.length" class="file-list">
          <div v-for="file in selectedFiles" :key="file.name + file.size" class="file-chip">
            {{ file.name }}
          </div>
        </div>

        <div v-if="formError" class="form-error">
          {{ formError }}
        </div>
      </div>

      <div class="actions">
        <button class="cancel-btn" @click="emit('close')">Отмена</button>
        <button class="submit-btn" :disabled="saving || loading" @click="submit">
          {{ saving ? 'Сохранение...' : 'Создать штраф' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  width: min(640px, 100%);
  background: #ffffff;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
}

.modal-header p {
  margin: 8px 0 0;
  color: #64748b;
  line-height: 1.5;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
}

.form label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form input,
.form select,
.form textarea {
  width: 100%;
  padding: 13px 14px;
  border-radius: 14px;
  border: 1px solid #dbe5f0;
  background: #ffffff;
  color: #172033;
  box-sizing: border-box;
}

.form textarea {
  min-height: 96px;
  resize: vertical;
}

.selection-note,
.helper-text {
  margin: 0;
  font-size: 13px;
  color: #68768b;
  line-height: 1.5;
}

.helper-text {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 14px;
  padding: 12px 14px;
  color: #9a3412;
}

.file-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.file-chip {
  padding: 9px 12px;
  border-radius: 12px;
  background: #eef4ff;
  color: #1d4ed8;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.state-box {
  margin: 24px;
  padding: 18px;
  border-radius: 18px;
  background: #f8fafc;
  color: #334155;
}

.state-box--error,
.form-error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.form-error {
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px 24px;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-btn {
  background: #eef2f7;
  color: #172033;
}

.submit-btn {
  background: #172033;
  color: #ffffff;
}

.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .modal-header,
  .actions {
    flex-direction: column;
  }
}
</style>

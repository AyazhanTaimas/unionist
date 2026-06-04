<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from '@/app/i18n'
import { createNews, updateNews } from './api'

type NewsLocale = 'ru' | 'kk' | 'en'

const props = defineProps<{
  news?: any | null
}>()

const emit = defineEmits(['close', 'created'])
const { t } = useI18n()

const locales: Array<{ code: NewsLocale; label: string }> = [
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
  { code: 'en', label: 'EN' },
]

const activeLocale = ref<NewsLocale>('ru')
const activeLocaleLabel = computed(
  () => locales.find((item) => item.code === activeLocale.value)?.label || activeLocale.value.toUpperCase()
)
const form = ref<Record<NewsLocale, { title: string; description: string }>>({
  ru: { title: '', description: '' },
  kk: { title: '', description: '' },
  en: { title: '', description: '' },
})
const file = ref<File | null>(null)
const loading = ref(false)

const resetForm = (news?: any | null) => {
  form.value = {
    ru: {
      title: news?.title_ru ?? news?.translations?.ru?.title ?? news?.title ?? '',
      description:
        news?.description_ru ?? news?.translations?.ru?.description ?? news?.description ?? '',
    },
    kk: {
      title: news?.translations?.kk?.title ?? '',
      description: news?.translations?.kk?.description ?? '',
    },
    en: {
      title: news?.translations?.en?.title ?? '',
      description: news?.translations?.en?.description ?? '',
    },
  }
  activeLocale.value = 'ru'
  file.value = null
}

watch(
  () => props.news,
  (val) => resetForm(val),
  { immediate: true }
)

const handleFile = (e: any) => {
  file.value = e.target.files[0]
}

const submit = async () => {
  const emptyLocale = locales.find(
    (item) =>
      !form.value[item.code].title.trim() ||
      !form.value[item.code].description.trim()
  )

  if (emptyLocale) {
    activeLocale.value = emptyLocale.code
    return alert(t('pages.news.fillLocale', { locale: emptyLocale.label }))
  }

  loading.value = true

  try {
    const formData = new FormData()
    formData.append('title', form.value.ru.title.trim())
    formData.append('description', form.value.ru.description.trim())
    formData.append('translations[kk][title]', form.value.kk.title.trim())
    formData.append('translations[kk][description]', form.value.kk.description.trim())
    formData.append('translations[en][title]', form.value.en.title.trim())
    formData.append('translations[en][description]', form.value.en.description.trim())
    if (file.value) formData.append('photo', file.value)

    if (props.news) {
      await updateNews(props.news.id, formData) // ✏️ edit
    } else {
      await createNews(formData) // ➕ create
    }

    emit('created')
  } catch (error) {
    console.error(error)
    alert(props.news ? t('pages.news.updateError') : t('pages.news.createError'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <h2>
        {{ props.news ? t('pages.news.editTitle') : t('pages.news.createTitle') }}
      </h2>

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
        <label>
          <span>{{ t('common.title') }} {{ activeLocaleLabel }}</span>
          <input
            v-model="form[activeLocale].title"
            :placeholder="t('common.title')"
          />
        </label>

        <label>
          <span>{{ t('common.description') }} {{ activeLocaleLabel }}</span>
          <textarea
            v-model="form[activeLocale].description"
            :placeholder="t('common.description')"
          />
        </label>
      </div>

      <input type="file" @change="handleFile" />

      <div class="actions">
        <button class="save" :disabled="loading" @click="submit">
          {{ loading ? t('common.saving') : t('common.save') }}
        </button>

        <button @click="$emit('close')">
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.modal {
  width: min(560px, 100%);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: white;
  padding: 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #111827;
  font-size: 13px;
  font-weight: 600;
}

input, textarea {
  border: none;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 10px;
}

textarea {
  min-height: 100px;
}

.language-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.language-tab {
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #ffffff;
  color: #475569;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
}

.language-tab.active {
  border-color: #4f46e5;
  background: #eef2ff;
  color: #4f46e5;
}

.language-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.save {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
}

@media (max-width: 700px) {
  .modal {
    padding: 20px;
    border-radius: 18px;
  }

  .actions {
    flex-direction: column;
  }

  .actions button {
    width: 100%;
  }
}
</style>

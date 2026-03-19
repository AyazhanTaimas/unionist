<script setup lang="ts">
import { ref, watch } from 'vue'
import { createNews, updateNews } from './api'

const props = defineProps<{
  news?: any | null
}>()

const emit = defineEmits(['close', 'created'])

const title = ref('')
const description = ref('')
const file = ref<File | null>(null)
const loading = ref(false)

watch(
  () => props.news,
  (val) => {
    if (val) {
      title.value = val.title
      description.value = val.description
    } else {
      title.value = ''
      description.value = ''
    }
  },
  { immediate: true }
)

const handleFile = (e: any) => {
  file.value = e.target.files[0]
}

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || fallback

const submit = async () => {
  if (!title.value) return alert('Введите заголовок')

  loading.value = true

  try {
    const formData = new FormData()
    formData.append('title', title.value)
    formData.append('description', description.value)
    if (file.value) formData.append('photo', file.value)

    if (props.news) {
      await updateNews(props.news.id, formData) // ✏️ edit
    } else {
      await createNews(formData) // ➕ create
    }

    emit('created')
  } catch (error: any) {
    alert(
      getErrorMessage(
        error,
        props.news
          ? 'Не удалось обновить новость'
          : 'Не удалось создать новость'
      )
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <h2>
        {{ props.news ? 'Редактировать новость' : 'Создать новость' }}
      </h2>

      <input
        v-model="title"
        placeholder="Заголовок"
      />

      <textarea
        v-model="description"
        placeholder="Описание"
      />

      <input type="file" @change="handleFile" />

      <div class="actions">
        <button class="save" :disabled="loading" @click="submit">
          {{ loading ? 'Сохранение...' : 'Сохранить' }}
        </button>

        <button @click="$emit('close')">
          Отмена
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
}

.modal {
  width: 420px;
  background: white;
  padding: 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
</style>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreateNewsModal from './CreateNewsModal.vue'
import { getNews, deleteNews } from './api'
import type { NewsItem } from '@/roles/student/entities/news/model/types'

const newsList = ref<NewsItem[]>([])
const showModal = ref(false)
const selectedNews = ref<NewsItem | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const route = useRoute()
const router = useRouter()

const fetchNews = async () => {
  loading.value = true
  error.value = null
  try {
    newsList.value = await getNews()
  } catch {
    error.value = 'Ошибка загрузки новостей'
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  selectedNews.value = null
  void router.push('/manager/news/create')
}

const openEdit = (item: NewsItem) => {
  selectedNews.value = item
  showModal.value = true
}

const closeModal = async () => {
  showModal.value = false
  selectedNews.value = null

  if (route.name === 'manager-news-create') {
    await router.push('/manager/news')
  }
}

const handleCreated = async () => {
  await fetchNews()
  await closeModal()
}

watch(
  () => route.name,
  (name) => {
    if (name === 'manager-news-create') {
      selectedNews.value = null
      showModal.value = true
      return
    }

    if (!selectedNews.value) {
      showModal.value = false
    }
  },
  { immediate: true }
)

const remove = async (id: number) => {
  if (!confirm('Удалить новость?')) return

  try {
    await deleteNews(id)
    await fetchNews()
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Не удалось удалить новость')
  }
}

onMounted(fetchNews)
</script>

<template>
  <div class="news-page">
    <div class="header">
      <h2>Новости</h2>

      <button class="add-btn" @click="openCreate">
        +
      </button>
    </div>

    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else class="news-list">
      <div
        v-for="item in newsList"
        :key="item.id"
        class="news-card"
      >
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>

        <div class="actions">
          <button class="edit" @click="openEdit(item)">✏️</button>
          <button class="delete" @click="remove(item.id)">🗑</button>
        </div>
      </div>
    </div>

    <CreateNewsModal
      v-if="showModal"
      :news="selectedNews"
      @close="closeModal"
      @created="handleCreated"
    />
  </div>
</template>

<style scoped>
.news-page {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: #4f46e5;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.news-list {
  margin-top: 20px;
}

.news-card {
  background: white;
  padding: 16px;
  border-radius: 14px;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.edit {
  background: #eef2ff;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.delete {
  background: #fee2e2;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
}
</style>

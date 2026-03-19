<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CreateNewsModal from './CreateNewsModal.vue'
import { getNews, deleteNews } from './api'

const newsList = ref<any[]>([])
const showModal = ref(false)
const selectedNews = ref<any | null>(null)
const loading = ref(false)

const fetchNews = async () => {
  loading.value = true
  try {
    const res = await getNews()
    newsList.value = res.data
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  selectedNews.value = null
  showModal.value = true
}

const openEdit = (item: any) => {
  selectedNews.value = item
  showModal.value = true
}

const remove = async (id: number) => {
  if (!confirm('Удалить новость?')) return
  await deleteNews(id)
  await fetchNews()
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

    <div v-if="loading">Loading...</div>

    <div class="news-list">
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
      @close="showModal = false"
      @created="fetchNews"
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
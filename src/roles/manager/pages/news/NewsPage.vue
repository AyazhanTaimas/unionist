<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/app/i18n'
import CreateNewsModal from './CreateNewsModal.vue'
import { getNews, deleteNews } from './api'
import type { NewsItem } from '@/roles/student/entities/news/model/types'

type NewsLocale = 'ru' | 'kk' | 'en'

const newsList = ref<NewsItem[]>([])
const showModal = ref(false)
const selectedNews = ref<NewsItem | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const fetchNews = async () => {
  loading.value = true
  error.value = null
  try {
    newsList.value = await getNews()
  } catch {
    error.value = t('pages.news.loadError')
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

const getLocalizedTitle = (item: NewsItem) => {
  const currentLocale = locale.value as NewsLocale
  const translated = item.translations?.[currentLocale]?.title

  return translated?.trim() || item.title_ru || item.title
}

const getLocalizedDescription = (item: NewsItem) => {
  const currentLocale = locale.value as NewsLocale
  const translated = item.translations?.[currentLocale]?.description

  return translated?.trim() || item.description_ru || item.description
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
  if (!confirm(t('pages.news.deleteConfirm'))) return

  try {
    await deleteNews(id)
    await fetchNews()
  } catch (error) {
    console.error(error)
    alert(t('pages.news.deleteError'))
  }
}

watch(locale, fetchNews, { immediate: true })
</script>

<template>
  <div class="news-page">
    <div class="header">
      <h2>{{ t('pages.news.title') }}</h2>

      <button class="add-btn" @click="openCreate">
        +
      </button>
    </div>

    <div v-if="loading">{{ t('pages.news.loading') }}</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else class="news-list">
      <div
        v-for="item in newsList"
        :key="item.id"
        class="news-card"
      >
        <h3>{{ getLocalizedTitle(item) }}</h3>
        <p>{{ getLocalizedDescription(item) }}</p>

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

@media (max-width: 700px) {
  .news-page {
    padding: 0;
  }

  .header {
    gap: 12px;
  }

  .news-card {
    padding: 14px;
  }
}
</style>

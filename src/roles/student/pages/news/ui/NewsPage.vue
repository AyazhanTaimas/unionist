<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NewsCard from '@/roles/student/entities/news/ui/NewsCard.vue'
import { getNews } from '@/roles/student/pages/news/NewsApi'
import type { NewsItem } from '@/roles/student/entities/news/model/types'

const news = ref<NewsItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    news.value = await getNews()
  } catch (e) {
    error.value = 'Ошибка загрузки новостей'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="news-page">
    <h1 class="page-title">НОВОСТИ</h1>

    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">{{ error }}</div>

    <div v-else class="news-list">
      <NewsCard
        v-for="item in news"
        :key="item.id"
        :item="item"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.news-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
   font-family: 'Montserrat', sans-serif;
}
</style>

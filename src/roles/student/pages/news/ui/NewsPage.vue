<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import NewsCard from '@/roles/student/entities/news/ui/NewsCard.vue'
import { getNews } from '@/roles/student/pages/news/NewsApi'
import type { NewsItem } from '@/roles/student/entities/news/model/types'
import { useI18n } from '@/app/i18n'

const news = ref<NewsItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const { locale, t } = useI18n()
const pageTitle = computed(() => t('nav.news'))

let requestId = 0

const fetchNews = async () => {
  const currentRequestId = ++requestId
  loading.value = true
  error.value = null

  try {
    const items = await getNews()

    if (currentRequestId === requestId) {
      news.value = items
    }
  } catch (e) {
    if (currentRequestId === requestId) {
      error.value = t('pages.news.loadError')
    }
  } finally {
    if (currentRequestId === requestId) {
      loading.value = false
    }
  }
}

watch(locale, fetchNews, { immediate: true })
</script>

<template>
  <section class="news-page">
    <h1 class="page-title">{{ pageTitle }}</h1>

    <div v-if="loading">{{ t('pages.news.loading') }}</div>
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
  height: 100%;
  min-height: 0;
  gap: 24px;
}

.page-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  text-align: center;
  text-transform: uppercase;
}

.news-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Montserrat', sans-serif;
}

.news-list::-webkit-scrollbar {
  width: 8px;
}

.news-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.65);
}

.news-list::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 700px) {
  .news-page {
    gap: 18px;
  }

  .page-title {
    font-size: 26px;
  }

  .news-list {
    padding-right: 0;
    gap: 14px;
  }
}
</style>

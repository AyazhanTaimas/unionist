<script setup lang="ts">
import type { NewsItem } from '../model/types'

defineProps<{
  item: NewsItem
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <article class="news-card">
    <h3 class="title">{{ item.title }}</h3>
    <p class="description">{{ item.description }}</p>
    <span class="date">{{ formatDate(item.created_at) }}</span>
  </article>
</template>

<style scoped lang="scss">
.news-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 24px;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

  display: flex;
  flex-direction: column;
  gap: 12px;

  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  }
}

.title {
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.description {
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
}

.date {
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 700px) {
  .news-card {
    padding: 16px 18px;
    border-radius: 18px;
  }

  .title {
    font-size: 16px;
  }
}
</style>

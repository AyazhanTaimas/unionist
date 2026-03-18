<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { buySellListings, formatListingPrice, getBuySellListingById } from './model'

const route = useRoute()
const router = useRouter()
const activeImageIndex = ref(0)

const routeListingId = computed(() => {
  const rawParam = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const parsedId = Number(rawParam)
  return Number.isFinite(parsedId) ? parsedId : null
})

const listing = computed(() => {
  if (routeListingId.value === null) return null
  return getBuySellListingById(routeListingId.value)
})

const activeImage = computed(() => {
  if (!listing.value) return ''
  return listing.value.images[activeImageIndex.value] ?? listing.value.images[0]
})

const relatedListings = computed(() => {
  if (!listing.value) return buySellListings.slice(0, 3)

  return buySellListings
    .filter((item) => item.id !== listing.value?.id)
    .slice(0, 3)
})

watch(
  () => listing.value?.id,
  () => {
    activeImageIndex.value = 0
  },
  { immediate: true }
)

function goBack() {
  router.push({ name: 'buysell' })
}
</script>

<template>
  <div class="detail-page">
    <section v-if="listing" class="detail-shell">
      <div class="detail-head">
        <button class="back-btn" @click="goBack">
          <span aria-hidden="true">‹</span>
          <span>Назад к списку</span>
        </button>

        <RouterLink class="ghost-link" :to="{ name: 'buysell' }">Все товары</RouterLink>
      </div>

      <div class="detail-layout">
        <div class="gallery-panel">
          <div class="hero-image">
            <img :src="activeImage" :alt="listing.title" />
          </div>

          <div v-if="listing.images.length > 1" class="thumb-row">
            <button
              v-for="(image, index) in listing.images"
              :key="`${listing.id}-${index}`"
              class="thumb-btn"
              :class="{ 'thumb-btn--active': activeImageIndex === index }"
              @click="activeImageIndex = index"
            >
              <img :src="image" :alt="`${listing.title} ${index + 1}`" />
            </button>
          </div>
        </div>

        <article class="info-panel">
          <div class="detail-kicker">Карточка товара</div>
          <h1>{{ listing.title }}</h1>
          <div class="price-row">
            <strong>{{ formatListingPrice(listing.price) }}</strong>
            <span>{{ listing.category }}</span>
          </div>

          <p class="description">{{ listing.description }}</p>

          <div class="detail-grid">
            <div class="detail-card">
              <span>Продавец</span>
              <strong>{{ listing.seller }}</strong>
            </div>
            <div class="detail-card">
              <span>Состояние</span>
              <strong>{{ listing.condition }}</strong>
            </div>
            <div class="detail-card">
              <span>Локация</span>
              <strong>{{ listing.location }}</strong>
            </div>
            <div class="detail-card">
              <span>Доставка</span>
              <strong>Встреча в общежитии</strong>
            </div>
          </div>

          <button class="contact-btn">Написать продавцу</button>
        </article>
      </div>

      <section class="related-panel">
        <div class="section-top">
          <div>
            <div class="detail-kicker">Другие предложения</div>
            <h2>Похожие товары</h2>
          </div>
          <RouterLink class="ghost-link" :to="{ name: 'buysell' }">Открыть каталог</RouterLink>
        </div>

        <div class="related-grid">
          <RouterLink
            v-for="item in relatedListings"
            :key="item.id"
            :to="{ name: 'buysell-detail', params: { id: item.id } }"
            class="related-card"
          >
            <div
              class="related-cover"
              :style="{ backgroundImage: `${item.accent}, url(${item.images[0]})` }"
            />
            <div class="related-copy">
              <strong>{{ item.title }}</strong>
              <span>{{ formatListingPrice(item.price) }}</span>
            </div>
          </RouterLink>
        </div>
      </section>
    </section>

    <section v-else class="missing-shell">
      <div class="detail-kicker">Buy-sell</div>
      <h1>Товар не найден</h1>
      <p>Объявление удалено или ссылка содержит неверный идентификатор.</p>
      <button class="back-btn" @click="goBack">
        <span aria-hidden="true">‹</span>
        <span>Вернуться в каталог</span>
      </button>
    </section>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100%;
  font-family: 'Montserrat', sans-serif;
}

.detail-shell,
.missing-shell {
  display: grid;
  gap: 24px;
  padding: 28px;
  border-radius: 32px;
  border: 1px solid rgba(157, 172, 210, 0.38);
  background:
    radial-gradient(circle at top right, rgba(79, 70, 229, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 255, 0.98));
  box-shadow: 0 24px 52px rgba(52, 64, 119, 0.12);
}

.detail-head,
.section-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.back-btn,
.ghost-link,
.thumb-btn,
.contact-btn {
  border: none;
  font: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.back-btn,
.ghost-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 999px;
  background: rgba(238, 242, 255, 0.92);
  color: #2d3a66;
  text-decoration: none;
  font-weight: 700;
  cursor: pointer;
}

.back-btn:hover,
.ghost-link:hover,
.contact-btn:hover,
.related-card:hover {
  transform: translateY(-1px);
}

.back-btn span:first-child {
  font-size: 1.3rem;
  line-height: 1;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.9fr);
  gap: 24px;
}

.gallery-panel,
.info-panel,
.related-panel {
  border-radius: 28px;
  border: 1px solid rgba(183, 194, 228, 0.42);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px rgba(57, 69, 119, 0.08);
}

.gallery-panel,
.info-panel {
  padding: 20px;
}

.hero-image {
  overflow: hidden;
  border-radius: 26px;
  aspect-ratio: 1.45;
  background: #e2e8f0;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  overflow-x: auto;
  scrollbar-width: none;
}

.thumb-row::-webkit-scrollbar {
  display: none;
}

.thumb-btn {
  flex: 0 0 88px;
  padding: 0;
  border-radius: 20px;
  overflow: hidden;
  background: #dbe3f8;
  border: 2px solid transparent;
  cursor: pointer;
}

.thumb-btn--active {
  border-color: #4f46e5;
}

.thumb-btn img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.info-panel {
  display: grid;
  align-content: start;
  gap: 16px;
}

.detail-kicker {
  color: #68789e;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.76rem;
  font-weight: 700;
}

.info-panel h1,
.section-top h2,
.missing-shell h1 {
  margin: 0;
  color: #0f172a;
}

.info-panel h1 {
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.price-row strong {
  color: #1d4ed8;
  font-size: 1.8rem;
}

.price-row span {
  padding: 8px 12px;
  border-radius: 999px;
  background: #eef2ff;
  color: #46567c;
  font-weight: 700;
}

.description,
.missing-shell p {
  margin: 0;
  color: #5d6781;
  line-height: 1.7;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-card {
  border-radius: 20px;
  padding: 16px;
  background: linear-gradient(180deg, #f8faff, #eef2ff);
}

.detail-card span {
  display: block;
  color: #7b88a8;
  font-size: 0.82rem;
}

.detail-card strong {
  display: block;
  margin-top: 8px;
  color: #18233e;
}

.contact-btn {
  min-height: 56px;
  border-radius: 18px;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  box-shadow: 0 16px 28px rgba(37, 99, 235, 0.24);
  cursor: pointer;
}

.related-panel {
  padding: 20px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.related-card {
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(203, 213, 225, 0.72);
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.related-card:hover {
  border-color: rgba(79, 70, 229, 0.48);
  box-shadow: 0 16px 34px rgba(79, 70, 229, 0.16);
}

.related-cover {
  aspect-ratio: 1.4;
  background-size: cover;
  background-position: center;
  background-blend-mode: multiply;
}

.related-copy {
  display: grid;
  gap: 8px;
  padding: 14px;
}

.related-copy strong {
  color: #111827;
}

.related-copy span {
  color: #1d4ed8;
  font-weight: 800;
}

.missing-shell {
  justify-items: start;
}

@media (max-width: 980px) {
  .detail-shell,
  .missing-shell {
    padding: 22px;
    border-radius: 28px;
  }

  .detail-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .detail-shell,
  .missing-shell,
  .gallery-panel,
  .info-panel,
  .related-panel {
    padding: 18px;
    border-radius: 24px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 540px) {
  .detail-shell,
  .missing-shell {
    gap: 18px;
    padding: 16px;
  }

  .thumb-btn {
    flex-basis: 72px;
  }
}
</style>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBuySellListing, getBuySellListings, type BuySellListing } from './api'
import { formatListingDate, formatListingPrice, getListingAccent, getListingCoverStyle, getListingSellerName } from './model'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const listing = ref<BuySellListing | null>(null)
const relatedListings = ref<BuySellListing[]>([])
const activeImageIndex = ref(0)

const listingId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
})

const activeImage = computed(() => {
  if (!listing.value) return ''
  return listing.value.images[activeImageIndex.value] ?? listing.value.images[0] ?? ''
})

const sellerName = computed(() => {
  if (!listing.value) return 'Студент'
  return getListingSellerName(listing.value)
})

const contactHref = computed(() => {
  const phone = listing.value?.contact_phone?.trim()
  return phone ? `tel:${phone}` : null
})

async function loadListing(id: number) {
  loading.value = true
  error.value = null
  activeImageIndex.value = 0

  try {
    const currentListing = await getBuySellListing(id)
    listing.value = currentListing

    relatedListings.value = await getBuySellListings({
      exclude_id: currentListing.id,
      limit: 3,
    })
  } catch (e) {
    console.error(e)
    listing.value = null
    relatedListings.value = []
    error.value = 'Не удалось загрузить объявление'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: 'buysell' })
}

watch(
  () => listingId.value,
  (id) => {
    if (id === null) {
      error.value = 'Неверный идентификатор товара'
      listing.value = null
      relatedListings.value = []
      loading.value = false
      return
    }

    loadListing(id)
  },
  { immediate: true }
)
</script>

<template>
  <div class="detail-page">
    <section v-if="loading" class="state-shell">
      <strong>Загрузка товара...</strong>
    </section>

    <section v-else-if="!listing" class="state-shell">
      <div class="detail-kicker">Buy-sell</div>
      <h1>{{ error || 'Товар не найден' }}</h1>
      <p>Объявление удалено или ссылка больше неактуальна.</p>
      <button class="back-btn" @click="goBack">
        <span aria-hidden="true">‹</span>
        <span>Вернуться в каталог</span>
      </button>
    </section>

    <section v-else class="detail-shell">
      <div class="detail-head">
        <button class="back-btn" @click="goBack">
          <span aria-hidden="true">‹</span>
          <span>Назад к списку</span>
        </button>

        <RouterLink class="ghost-link" :to="{ name: 'buysell-my' }">Мои товары</RouterLink>
      </div>

      <div class="detail-layout">
        <div class="gallery-panel">
          <div
            v-if="!activeImage"
            class="hero-image hero-image--fallback"
            :style="{ backgroundImage: getListingAccent(listing.id) }"
          />
          <div v-else class="hero-image">
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
            <span>{{ listing.category_label }}</span>
          </div>

          <p class="description">{{ listing.description }}</p>

          <div class="detail-grid">
            <div class="detail-card">
              <span>Продавец</span>
              <strong>{{ sellerName }}</strong>
            </div>
            <div class="detail-card">
              <span>Состояние</span>
              <strong>{{ listing.condition_label }}</strong>
            </div>
            <div class="detail-card">
              <span>Локация</span>
              <strong>{{ listing.pickup_location || 'Самовывоз из общежития' }}</strong>
            </div>
            <div class="detail-card">
              <span>Размещено</span>
              <strong>{{ formatListingDate(listing.created_at) || 'Недавно' }}</strong>
            </div>
          </div>

          <a v-if="contactHref" class="contact-btn" :href="contactHref">
            Позвонить продавцу
          </a>
          <button v-else class="contact-btn contact-btn--disabled" disabled>
            Контакт пока не указан
          </button>
        </article>
      </div>

      <section v-if="relatedListings.length" class="related-panel">
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
            <div class="related-cover" :style="getListingCoverStyle(item)" />
            <div class="related-copy">
              <strong>{{ item.title }}</strong>
              <span>{{ formatListingPrice(item.price) }}</span>
            </div>
          </RouterLink>
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100%;
  font-family: 'Montserrat', sans-serif;
}

.detail-shell,
.state-shell {
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

.state-shell {
  place-items: center;
  min-height: 340px;
  text-align: center;
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

.contact-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 52px;
  padding: 0 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 16px 28px rgba(79, 70, 229, 0.22);
}

.contact-btn--disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
}

.detail-kicker {
  color: #68789e;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.76rem;
  font-weight: 700;
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

.hero-image--fallback {
  background-size: cover;
  background-position: center;
}

.hero-image img,
.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
  overflow-x: auto;
}

.thumb-btn {
  width: 92px;
  height: 92px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 20px;
  overflow: hidden;
  background: #e2e8f0;
  cursor: pointer;
}

.thumb-btn--active {
  border-color: #4f46e5;
}

.info-panel {
  display: grid;
  gap: 18px;
}

.info-panel h1,
.section-top h2,
.state-shell h1 {
  margin: 0;
  color: #0f172a;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.price-row strong {
  font-size: 1.8rem;
  color: #1d4ed8;
}

.price-row span,
.detail-card span {
  color: #5b6785;
}

.description {
  margin: 0;
  color: #334155;
  line-height: 1.8;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-card {
  padding: 16px;
  border-radius: 20px;
  background: #f8fafc;
  border: 1px solid rgba(203, 213, 225, 0.6);
}

.detail-card strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
}

.related-panel {
  padding: 20px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.related-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 24px;
  border: 1px solid rgba(206, 215, 237, 0.52);
  background: #fff;
  text-decoration: none;
  color: inherit;
}

.related-cover {
  min-height: 160px;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
}

.related-copy {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.related-copy strong {
  color: #0f172a;
}

.related-copy span {
  color: #1d4ed8;
  font-weight: 700;
}

@media (max-width: 900px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .detail-shell,
  .state-shell {
    padding: 20px;
    border-radius: 24px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

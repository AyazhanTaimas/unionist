<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/app/i18n'
import { getBuySellListings, getBuySellMeta, type BuySellListing, type BuySellOption } from './api'
import {
  formatListingDate,
  formatListingPrice,
  getBuySellCategoryLabel,
  getListingCategoryLabel,
  getListingConditionLabel,
  getListingCoverStyle,
  getListingSellerName,
} from './model'

const router = useRouter()
const { t } = useI18n()

const loading = ref(true)
const error = ref<string | null>(null)
const searchTerm = ref('')
const selectedCategory = ref('all')
const listings = ref<BuySellListing[]>([])
const categories = ref<BuySellOption[]>([])

const filterCategories = computed(() => [
  { value: 'all', label: t('common.all') },
  ...categories.value.map((category) => ({
    ...category,
    label: getBuySellCategoryLabel(category.value, category.label),
  })),
])

const filteredListings = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  return listings.value.filter((listing) => {
    const matchesCategory =
      selectedCategory.value === 'all' || listing.category === selectedCategory.value

    const matchesQuery =
      !query ||
      listing.title.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query) ||
      getListingSellerName(listing).toLowerCase().includes(query)

    return matchesCategory && matchesQuery
  })
})

async function loadCatalog() {
  loading.value = true
  error.value = null

  try {
    const [meta, catalog] = await Promise.all([
      getBuySellMeta(),
      getBuySellListings({ limit: 60 }),
    ])

    categories.value = meta.categories
    listings.value = catalog
  } catch (e) {
    console.error(e)
    error.value = t('pages.buySell.loadError')
    listings.value = []
  } finally {
    loading.value = false
  }
}

function openMyListings() {
  router.push({ name: 'buysell-my' })
}

function openCreateListing() {
  router.push({ name: 'buysell-my', query: { create: '1' } })
}

onMounted(() => {
  loadCatalog()
})
</script>

<template>
  <div class="buysell-page">
    <section class="market-shell">
      <div class="market-topbar">
        <div class="topbar-copy">
          <div class="eyebrow">{{ t('pages.buySell.eyebrow') }}</div>
          <h1>{{ t('pages.buySell.title') }}</h1>
          <p>
            {{ t('pages.buySell.subtitle') }}
          </p>
        </div>

        <div class="topbar-actions">
          <button class="outline-btn" @click="openMyListings">{{ t('pages.buySell.myListings') }}</button>
          <button class="primary-btn" @click="openCreateListing">{{ t('pages.buySell.publish') }}</button>
        </div>
      </div>

      <div class="market-toolbar">
        <label class="search-box">
          <span class="search-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input v-model="searchTerm" type="text" :placeholder="t('pages.buySell.searchPlaceholder')" />
        </label>

        <div class="category-row">
          <button
            v-for="category in filterCategories"
            :key="category.value"
            class="category-chip"
            :class="{ 'category-chip--active': selectedCategory === category.value }"
            @click="selectedCategory = category.value"
          >
            {{ category.label }}
          </button>
        </div>
      </div>

      <section class="catalog-panel">
        <div class="catalog-head">
          <div>
            <div class="panel-kicker">{{ t('pages.buySell.catalog') }}</div>
            <strong>{{ t('pages.buySell.catalogCount', { count: filteredListings.length }) }}</strong>
          </div>
          <span class="catalog-note">{{ t('pages.buySell.catalogHint') }}</span>
        </div>

        <div v-if="loading" class="empty-state">
          <strong>{{ t('pages.buySell.loadingListings') }}</strong>
        </div>

        <div v-else-if="error" class="empty-state">
          <strong>{{ error }}</strong>
          <button class="outline-btn" @click="loadCatalog">{{ t('pages.buySell.retry') }}</button>
        </div>

        <div v-else-if="filteredListings.length" class="listing-grid">
          <RouterLink
            v-for="listing in filteredListings"
            :key="listing.id"
            :to="{ name: 'buysell-detail', params: { id: listing.id } }"
            class="listing-card"
          >
            <div class="listing-cover" :style="getListingCoverStyle(listing)" />

            <div class="listing-copy">
              <div class="listing-meta">
                <span>{{ getListingCategoryLabel(listing) }}</span>
                <span>{{ getListingConditionLabel(listing) }}</span>
              </div>

              <h2>{{ listing.title }}</h2>
              <div class="listing-price">{{ formatListingPrice(listing.price) }}</div>
              <p>{{ listing.description }}</p>

              <div class="listing-footer">
                <div>
                  <strong>{{ getListingSellerName(listing) }}</strong>
                  <span>{{ listing.pickup_location || t('pages.buySell.pickupFallback') }}</span>
                </div>
                <time v-if="listing.created_at">{{ formatListingDate(listing.created_at) }}</time>
              </div>
            </div>
          </RouterLink>
        </div>

        <div v-else class="empty-state">
          <strong>{{ t('pages.buySell.nothingFound') }}</strong>
          <p>{{ t('pages.buySell.emptyHint') }}</p>
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped>
.buysell-page {
  min-height: 100%;
  font-family: 'Montserrat', sans-serif;
}

.market-shell {
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

.market-topbar,
.catalog-head,
.listing-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.topbar-copy {
  max-width: 760px;
}

.eyebrow,
.panel-kicker {
  color: #68789e;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.76rem;
  font-weight: 700;
}

.market-topbar h1 {
  margin: 12px 0 10px;
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 0.95;
  color: #0f172a;
}

.market-topbar p,
.catalog-note,
.listing-copy p,
.listing-footer span,
.empty-state p {
  color: #5b6785;
  line-height: 1.7;
}

.topbar-actions,
.market-toolbar,
.category-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

button {
  border: none;
  font: inherit;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

button:hover,
.listing-card:hover {
  transform: translateY(-1px);
}

.outline-btn,
.primary-btn,
.category-chip {
  border-radius: 999px;
}

.outline-btn,
.primary-btn {
  padding: 13px 18px;
  font-weight: 700;
}

.outline-btn {
  color: #2b3561;
  background: rgba(238, 242, 255, 0.92);
}

.primary-btn {
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  box-shadow: 0 14px 28px rgba(79, 70, 229, 0.22);
}

.search-box {
  min-width: min(100%, 360px);
  flex: 1 1 320px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  height: 52px;
  border-radius: 18px;
  border: 1px solid rgba(179, 191, 229, 0.46);
  background: rgba(255, 255, 255, 0.86);
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: #1f2a44;
}

.search-icon svg {
  width: 18px;
  height: 18px;
  color: #8090b2;
}

.category-chip {
  padding: 11px 16px;
  background: #eef2ff;
  color: #4c5a7b;
  font-weight: 600;
}

.category-chip--active {
  background: #0f172a;
  color: #fff;
}

.catalog-panel {
  border-radius: 28px;
  border: 1px solid rgba(183, 194, 228, 0.42);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 40px rgba(57, 69, 119, 0.08);
  padding: 20px;
}

.listing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.listing-card {
  display: grid;
  gap: 16px;
  padding: 14px;
  border-radius: 24px;
  border: 1px solid rgba(206, 215, 237, 0.52);
  background: #fff;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 18px 32px rgba(57, 69, 119, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.listing-card:hover {
  box-shadow: 0 20px 40px rgba(57, 69, 119, 0.12);
}

.listing-cover {
  min-height: 210px;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
}

.listing-copy {
  display: grid;
  gap: 10px;
}

.listing-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.listing-meta span,
.listing-footer time {
  padding: 8px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #465377;
  font-size: 0.84rem;
  font-weight: 600;
}

.listing-copy h2 {
  margin: 0;
  font-size: 1.1rem;
  color: #0f172a;
}

.listing-price {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1d4ed8;
}

.listing-copy p {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.listing-footer {
  align-items: center;
}

.listing-footer strong {
  display: block;
  color: #1f2a44;
}

.empty-state {
  display: grid;
  place-items: center;
  gap: 8px;
  min-height: 220px;
  text-align: center;
  padding: 24px;
}

@media (max-width: 768px) {
  .market-shell {
    padding: 20px;
    border-radius: 24px;
  }

  .market-topbar,
  .catalog-head,
  .listing-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .topbar-actions {
    width: 100%;
  }

  .topbar-actions button {
    flex: 1;
  }

  .listing-cover {
    min-height: 180px;
  }
}
</style>

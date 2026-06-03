<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/app/i18n'
import ListingFormModal from './ListingFormModal.vue'
import {
  deleteBuySellListing,
  getBuySellListings,
  getBuySellMeta,
  type BuySellListing,
  type BuySellMeta,
} from './api'
import {
  formatListingDate,
  formatListingPrice,
  getListingCategoryLabel,
  getListingCoverStyle,
  getListingStatusLabel,
} from './model'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loading = ref(true)
const error = ref<string | null>(null)
const listings = ref<BuySellListing[]>([])
const meta = ref<BuySellMeta>({
  categories: [],
  conditions: [],
  statuses: [],
})
const showModal = ref(false)
const selectedListing = ref<BuySellListing | null>(null)

const activeCount = computed(() =>
  listings.value.filter((listing) => listing.status === 'active').length
)

const soldCount = computed(() =>
  listings.value.filter((listing) => listing.status === 'sold').length
)

async function loadManagePage() {
  loading.value = true
  error.value = null

  try {
    const [metaResponse, myListings] = await Promise.all([
      getBuySellMeta(),
      getBuySellListings({ mine: true, limit: 100 }),
    ])

    meta.value = metaResponse
    listings.value = myListings
  } catch (e) {
    console.error(e)
    error.value = t('pages.buySell.manageLoadError')
    listings.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  selectedListing.value = null
  showModal.value = true
  router.replace({ name: 'buysell-my', query: { create: '1' } })
}

function openEdit(listing: BuySellListing) {
  selectedListing.value = listing
  showModal.value = true
}

function closeModal() {
  selectedListing.value = null
  showModal.value = false

  if (route.query.create === '1') {
    router.replace({ name: 'buysell-my' })
  }
}

async function handleSaved() {
  await loadManagePage()
  closeModal()
}

async function handleDelete(listing: BuySellListing) {
  if (!confirm(t('pages.buySell.deleteConfirm', { title: listing.title }))) {
    return
  }

  try {
    await deleteBuySellListing(listing.id)
    await loadManagePage()
  } catch (e) {
    console.error(e)
    alert(t('pages.buySell.deleteError'))
  }
}

watch(
  () => route.query.create,
  (value) => {
    if (value === '1') {
      selectedListing.value = null
      showModal.value = true
      return
    }

    if (!selectedListing.value) {
      showModal.value = false
    }
  },
  { immediate: true }
)

onMounted(() => {
  loadManagePage()
})
</script>

<template>
  <div class="manage-page">
    <section class="manage-shell">
      <div class="manage-topbar">
        <div>
          <div class="eyebrow">{{ t('pages.buySell.manageEyebrow') }}</div>
          <h1>{{ t('pages.buySell.manageTitle') }}</h1>
          <p>{{ t('pages.buySell.manageSubtitle') }}</p>
        </div>

        <div class="topbar-actions">
          <RouterLink class="outline-link" :to="{ name: 'buysell' }">{{ t('pages.buySell.openCatalog') }}</RouterLink>
          <button class="primary-btn" @click="openCreate">{{ t('pages.buySell.newListing') }}</button>
        </div>
      </div>

      <div class="stats-grid">
        <article class="stat-card">
          <span>{{ t('pages.buySell.totalListings') }}</span>
          <strong>{{ listings.length }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ t('pages.buySell.activeListings') }}</span>
          <strong>{{ activeCount }}</strong>
        </article>
        <article class="stat-card">
          <span>{{ t('pages.buySell.soldListings') }}</span>
          <strong>{{ soldCount }}</strong>
        </article>
      </div>

      <section class="panel">
        <div v-if="loading" class="empty-state">
          <strong>{{ t('pages.buySell.loadingMyListings') }}</strong>
        </div>

        <div v-else-if="error" class="empty-state">
          <strong>{{ error }}</strong>
          <button class="outline-btn" @click="loadManagePage">{{ t('pages.buySell.retry') }}</button>
        </div>

        <div v-else-if="listings.length" class="listing-grid">
          <article v-for="listing in listings" :key="listing.id" class="listing-card">
            <div class="listing-cover" :style="getListingCoverStyle(listing)" />

            <div class="listing-copy">
              <div class="listing-meta">
                <span>{{ getListingCategoryLabel(listing) }}</span>
                <span :class="`status-pill status-pill--${listing.status}`">
                  {{ getListingStatusLabel(listing) }}
                </span>
              </div>

              <h2>{{ listing.title }}</h2>
              <div class="price-row">
                <strong>{{ formatListingPrice(listing.price) }}</strong>
                <time v-if="listing.created_at">{{ formatListingDate(listing.created_at) }}</time>
              </div>

              <p>{{ listing.description }}</p>

              <div class="actions">
                <RouterLink class="ghost-btn" :to="{ name: 'buysell-detail', params: { id: listing.id } }">
                  {{ t('pages.buySell.open') }}
                </RouterLink>
                <button class="ghost-btn" @click="openEdit(listing)">{{ t('common.edit') }}</button>
                <button class="danger-btn" @click="handleDelete(listing)">{{ t('common.delete') }}</button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <strong>{{ t('pages.buySell.noOwnListings') }}</strong>
          <p>{{ t('pages.buySell.noOwnListingsHint') }}</p>
          <button class="primary-btn" @click="openCreate">{{ t('pages.buySell.publishProduct') }}</button>
        </div>
      </section>
    </section>

    <ListingFormModal
      v-if="showModal"
      :listing="selectedListing"
      :categories="meta.categories"
      :conditions="meta.conditions"
      :statuses="meta.statuses"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<style scoped>
.manage-page {
  min-height: 100%;
  font-family: 'Montserrat', sans-serif;
}

.manage-shell {
  display: grid;
  gap: 24px;
  padding: 28px;
  border-radius: 32px;
  border: 1px solid rgba(157, 172, 210, 0.38);
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 255, 0.98));
  box-shadow: 0 24px 52px rgba(52, 64, 119, 0.12);
}

.manage-topbar,
.stats-grid,
.listing-meta,
.price-row,
.actions {
  display: flex;
  gap: 12px;
}

.manage-topbar {
  align-items: flex-start;
  justify-content: space-between;
}

.eyebrow {
  color: #68789e;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.76rem;
  font-weight: 700;
}

.manage-topbar h1 {
  margin: 12px 0 10px;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
  color: #0f172a;
}

.manage-topbar p {
  margin: 0;
  max-width: 640px;
  color: #5b6785;
  line-height: 1.7;
}

.topbar-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.outline-link,
.outline-btn,
.primary-btn,
.ghost-btn,
.danger-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  font: inherit;
  text-decoration: none;
  cursor: pointer;
}

.outline-link,
.outline-btn,
.ghost-btn {
  background: rgba(238, 242, 255, 0.92);
  color: #2b3561;
}

.primary-btn {
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: #fff;
}

.danger-btn {
  background: #fee2e2;
  color: #991b1b;
}

.stats-grid {
  flex-wrap: wrap;
}

.stat-card {
  flex: 1 1 180px;
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid rgba(203, 213, 225, 0.56);
  background: #fff;
}

.stat-card span {
  color: #5b6785;
}

.stat-card strong {
  display: block;
  margin-top: 12px;
  font-size: 2rem;
  color: #0f172a;
}

.panel {
  border-radius: 28px;
  border: 1px solid rgba(183, 194, 228, 0.42);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 40px rgba(57, 69, 119, 0.08);
  padding: 20px;
}

.listing-grid {
  display: grid;
  gap: 16px;
}

.listing-card {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 16px;
  padding: 14px;
  border-radius: 24px;
  border: 1px solid rgba(206, 215, 237, 0.52);
  background: #fff;
}

.listing-cover {
  min-height: 180px;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
}

.listing-copy {
  display: grid;
  gap: 10px;
}

.listing-meta {
  flex-wrap: wrap;
}

.listing-meta span {
  padding: 8px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #465377;
  font-size: 0.84rem;
  font-weight: 600;
}

.status-pill--active {
  background: #dcfce7 !important;
  color: #166534 !important;
}

.status-pill--draft {
  background: #e0e7ff !important;
  color: #3730a3 !important;
}

.status-pill--sold {
  background: #fee2e2 !important;
  color: #991b1b !important;
}

.listing-copy h2 {
  margin: 0;
  color: #0f172a;
}

.price-row {
  justify-content: space-between;
  align-items: center;
}

.price-row strong {
  color: #1d4ed8;
  font-size: 1.4rem;
}

.price-row time,
.listing-copy p,
.empty-state p {
  color: #5b6785;
}

.listing-copy p {
  margin: 0;
}

.actions {
  flex-wrap: wrap;
  margin-top: 8px;
}

.empty-state {
  display: grid;
  place-items: center;
  gap: 8px;
  min-height: 220px;
  text-align: center;
  padding: 24px;
}

@media (max-width: 860px) {
  .manage-shell {
    padding: 20px;
    border-radius: 24px;
  }

  .manage-topbar {
    flex-direction: column;
  }

  .listing-card {
    grid-template-columns: 1fr;
  }
}
</style>

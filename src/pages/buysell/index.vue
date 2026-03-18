<script setup lang="ts">
import { computed, ref } from 'vue'
import { buySellCategories, buySellListings, formatListingPrice, type BuySellFilterCategory } from './model'

const searchTerm = ref('')
const selectedCategory = ref<BuySellFilterCategory>('Все')

const filteredListings = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()

  return buySellListings.filter((listing) => {
    const matchesCategory =
      selectedCategory.value === 'Все' || listing.category === selectedCategory.value
    const matchesQuery =
      !query ||
      listing.title.toLowerCase().includes(query) ||
      listing.seller.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query)

    return matchesCategory && matchesQuery
  })
})
</script>

<template>
  <div class="buysell-page">
    <section class="market-shell">
      <div class="market-topbar">
        <div>
          <div class="eyebrow">Campus market</div>
          <h1>Купи-продай</h1>
          <p>Полный список объявлений для студентов: учебники, техника и полезные вещи по общежитию.</p>
        </div>

        <div class="topbar-actions">
          <button class="outline-btn">Мои товары</button>
          <button class="primary-btn">Разместить</button>
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
          <input v-model="searchTerm" type="text" placeholder="Поиск товара" />
        </label>

        <div class="category-row">
          <button
            v-for="category in buySellCategories"
            :key="category"
            class="category-chip"
            :class="{ 'category-chip--active': selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <section class="catalog-panel">
        <div class="catalog-head">
          <div>
            <div class="panel-kicker">Каталог</div>
            <strong>{{ filteredListings.length }} объявлений</strong>
          </div>
          <span class="catalog-note">Нажмите на карточку, чтобы открыть отдельную страницу товара</span>
        </div>

        <div v-if="filteredListings.length" class="listing-grid">
          <RouterLink
            v-for="listing in filteredListings"
            :key="listing.id"
            :to="{ name: 'buysell-detail', params: { id: listing.id } }"
            class="listing-card"
          >
            <div
              class="listing-cover"
              :style="{ backgroundImage: `${listing.accent}, url(${listing.images[0]})` }"
            />
            <div class="listing-copy">
              <div class="listing-meta">
                <span>{{ listing.category }}</span>
                <span>{{ listing.condition }}</span>
              </div>
              <h2>{{ listing.title }}</h2>
              <div class="listing-price">{{ formatListingPrice(listing.price) }}</div>
              <p>{{ listing.description }}</p>
              <div class="listing-footer">
                <strong>{{ listing.seller }}</strong>
                <span>{{ listing.location }}</span>
              </div>
            </div>
          </RouterLink>
        </div>

        <div v-else class="empty-state">
          <strong>Ничего не найдено</strong>
          <p>Попробуйте другой запрос или переключите категорию.</p>
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

.market-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
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

.market-topbar p {
  margin: 0;
  max-width: 720px;
  color: #5b6785;
  line-height: 1.7;
}

.topbar-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
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
  background: rgba(238, 242, 255, 0.9);
}

.primary-btn {
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  box-shadow: 0 14px 28px rgba(79, 70, 229, 0.22);
}

.market-toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
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
  background: rgba(255, 255, 255, 0.82);
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: #1f2a44;
}

.search-box input::placeholder {
  color: #94a3b8;
}

.search-icon {
  display: inline-flex;
  color: #8090b2;
}

.search-icon svg {
  width: 18px;
  height: 18px;
}

.category-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px rgba(57, 69, 119, 0.08);
  padding: 20px;
}

.catalog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.catalog-head strong {
  display: block;
  margin-top: 6px;
  color: #101827;
  font-size: 1.3rem;
}

.catalog-note {
  color: #8090b2;
  font-size: 0.92rem;
}

.listing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.listing-card {
  display: grid;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(203, 213, 225, 0.72);
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.listing-card:hover {
  border-color: rgba(79, 70, 229, 0.48);
  box-shadow: 0 16px 34px rgba(79, 70, 229, 0.16);
}

.listing-cover {
  aspect-ratio: 1.35;
  background-size: cover;
  background-position: center;
  background-blend-mode: multiply;
}

.listing-copy {
  display: grid;
  gap: 10px;
  padding: 16px;
}

.listing-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.listing-meta span {
  padding: 6px 10px;
  border-radius: 999px;
  background: #f1f5ff;
  color: #61708f;
  font-size: 0.75rem;
  font-weight: 700;
}

.listing-copy h2 {
  margin: 0;
  font-size: 1.18rem;
  color: #111827;
}

.listing-price {
  color: #1d4ed8;
  font-size: 1.35rem;
  font-weight: 800;
}

.listing-copy p {
  margin: 0;
  color: #5d6781;
  line-height: 1.65;
}

.listing-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #7a879f;
  font-size: 0.9rem;
}

.listing-footer strong {
  color: #23304b;
}

.empty-state {
  border-radius: 24px;
  padding: 28px;
  text-align: center;
  background: linear-gradient(180deg, #f8fbff, #eff4ff);
  color: #5f6d8a;
}

.empty-state strong {
  display: block;
  color: #0f172a;
  font-size: 1.1rem;
}

.empty-state p {
  margin: 10px 0 0;
}

@media (max-width: 980px) {
  .market-shell {
    padding: 22px;
    border-radius: 28px;
  }

  .market-topbar {
    flex-direction: column;
  }

  .topbar-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .market-shell,
  .catalog-panel {
    padding: 18px;
    border-radius: 24px;
  }

  .market-toolbar {
    align-items: stretch;
  }

  .search-box {
    min-width: 0;
    flex-basis: 100%;
  }

  .topbar-actions,
  .category-row {
    width: 100%;
  }

  .outline-btn,
  .primary-btn,
  .category-chip {
    flex: 1 1 calc(50% - 6px);
    justify-content: center;
  }

  .catalog-head,
  .listing-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 540px) {
  .buysell-page {
    font-size: 15px;
  }

  .market-shell {
    gap: 18px;
    padding: 16px;
  }

  .listing-card {
    border-radius: 20px;
  }
}
</style>

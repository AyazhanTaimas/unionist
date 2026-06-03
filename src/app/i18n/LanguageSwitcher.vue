<script setup lang="ts">
import { useI18n, type Locale } from '@/app/i18n'

const { locale, localeMeta, setLocale, t } = useI18n()

const chooseLocale = (code: Locale) => {
  setLocale(code)
}
</script>

<template>
  <div class="language-switcher" :aria-label="t('common.language')">
    <button
      v-for="item in localeMeta"
      :key="item.code"
      class="language-switcher__button"
      :class="{ 'language-switcher__button--active': item.code === locale }"
      type="button"
      :title="item.label"
      @click="chooseLocale(item.code)"
    >
      {{ item.shortLabel }}
    </button>
  </div>
</template>

<style scoped>
.language-switcher {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid #d7e2ee;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.82);
}

.language-switcher__button {
  min-width: 34px;
  height: 30px;
  padding: 0 8px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.language-switcher__button:hover {
  background: #eef2ff;
  color: #4f46e5;
}

.language-switcher__button--active {
  background: #4f46e5;
  color: #ffffff;
}

@media (max-width: 520px) {
  .language-switcher {
    padding: 2px;
  }

  .language-switcher__button {
    min-width: 29px;
    height: 28px;
    padding: 0 5px;
    font-size: 11px;
  }
}
</style>

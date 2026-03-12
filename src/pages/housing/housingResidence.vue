<script setup lang="ts">
defineProps<{
  residenceTitle: string
}>()

defineEmits<{
  (e: 'change-room'): void
  (e: 'evict'): void
}>()
</script>

<template>
  <div class="residence-layout">
    <div class="residence-title-box">
      <h2 class="residence-title">{{ residenceTitle }}</h2>
    </div>

    <div class="residence-actions">
      <button class="action-tile action-tile--green" @click="$emit('change-room')">
        Поменять комнату
      </button>

      <button class="action-tile action-tile--pink" @click="$emit('evict')">
        Выселиться
      </button>
    </div>
  </div>
</template>

<style scoped>
.residence-layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.residence-title-box {
  background: #f4fbfb;
  border-radius: 28px;
  padding: 36px 28px;
}

.residence-title {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.residence-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  min-height: 280px;
}

.action-tile {
  border: none;
  border-radius: 30px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  cursor: pointer;
  transition: 0.2s ease;
  min-height: 280px;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.action-tile:hover {
  transform: translateY(-2px);
}

.action-tile--green {
  background: #dff3e3;
}

.action-tile--pink {
  background: #f8e7e7;
}

@media (max-width: 1100px) {
  .residence-actions {
    grid-template-columns: 1fr;
  }

  .action-tile {
    min-height: 180px;
    font-size: 24px;
  }
}

@media (max-width: 700px) {
  .residence-title {
    font-size: 24px;
  }

  .residence-title-box {
    padding: 24px 20px;
  }
}
</style>
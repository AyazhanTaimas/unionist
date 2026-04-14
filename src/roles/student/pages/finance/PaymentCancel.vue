<template>
  <div class="cancel-page">
    <div class="card">
      <div class="icon">⚠️</div>
      <h1>Оплата отменена</h1>
      <p>Платеж не был завершен. Вы можете попробовать снова.</p>
      <button @click="goPrimary">{{ primaryButtonText }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isGymPayment = computed(() => route.query.source === 'gym')
const primaryButtonText = computed(() =>
  isGymPayment.value ? 'Вернуться в тренажерный зал' : 'Вернуться к оплате'
)

function goPrimary() {
  router.push(isGymPayment.value ? '/gym' : '/finance')
}
</script>

<style scoped>
.cancel-page {
  min-height: 100vh;
  min-height: 100dvh;
  padding: 24px 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0f172a;
}

.card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  width: min(420px, 100%);
}

.icon {
  font-size: 48px;
  margin-bottom: 15px;
}

h1 {
  margin-bottom: 10px;
}

p {
  margin-bottom: 25px;
  color: #666;
}

button {
  padding: 12px 24px;
  background: #2563eb;
  border: none;
  color: white;
  border-radius: 8px;
  cursor: pointer;
}

@media (max-width: 700px) {
  .card {
    padding: 28px 20px;
  }

  h1 {
    font-size: 28px;
  }
}
</style>

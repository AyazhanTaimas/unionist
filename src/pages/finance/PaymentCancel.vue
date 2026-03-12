<template>
  <div class="cancel-page">
    <div class="card">
      <div class="icon">⚠️</div>
      <h1>Оплата отменена</h1>
      <p>Платеж не был завершен. Вы можете попробовать снова.</p>
      <button @click="goFinance">Вернуться к оплате</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goFinance() {
  router.push('/finance')
}
</script>

<style scoped>
.cancel-page {
  height: 100vh;
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
  width: 420px;
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
</style>

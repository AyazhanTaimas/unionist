<template>
  <div class="success-page">
    <div class="card">
      <div class="icon-wrapper">
        <svg viewBox="0 0 24 24" class="check-icon">
          <path
            d="M20 6L9 17L4 12"
            fill="none"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <h1>Оплата прошла успешно</h1>

      <p class="description">
        Ваш платеж был успешно обработан. <br />
        Спасибо за оплату.
      </p>

      <div class="buttons">
        <button class="primary" @click="goFinance">
          Перейти к оплатам
        </button>

        <button class="secondary" @click="goHome">
          На главную
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goFinance() {
  router.push('/finance')
}

function goHome() {
  router.push('/')
}
</script>

<style scoped>
.success-page {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at 30% 30%, #5b7cff, #3f51ff, #2c3eea);
  font-family: 'Montserrat', sans-serif;
}

.card {
  width: min(100%, 420px);
  background: white;
  padding: 48px 40px;
  border-radius: 20px;
  text-align: center;
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.15),
    0 8px 20px rgba(0, 0, 0, 0.08);
  animation: fadeUp 0.6s ease;
}

.icon-wrapper {
  width: 130px;
  height: 130px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #22c55e;
  box-shadow:
    0 0 0 10px rgba(34, 197, 94, 0.15),
    0 15px 30px rgba(34, 197, 94, 0.35);
  animation: pop 0.5s ease;
}

.check-icon {
  width: 70px;
  height: 70px;
}

h1 {
  font-size: 26px;
  margin-bottom: 10px;
  color: #111827;
}

.description {
  color: #6b7280;
  margin-bottom: 30px;
  line-height: 1.6;
  font-size: 15px;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

button {
  padding: 14px 18px;
  border-radius: 14px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.primary {
  background: linear-gradient(135deg, #2f3dff, #4669ff);
  color: white;
}

.primary:hover {
  transform: translateY(-1px);
}

.secondary {
  background: #eef2ff;
  color: #34446d;
}

.secondary:hover {
  background: #e2e8ff;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pop {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  70% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 720px) {
  .card {
    padding: 36px 24px;
  }
}
</style>

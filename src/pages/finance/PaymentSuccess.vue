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

      <h1>Оплата прошла успешно 🎉</h1>

      <p class="description">
        Ваш платеж был успешно обработан. <br />
        Спасибо за оплату!
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
  background: white;
  padding: 48px 40px;
  border-radius: 20px;
  text-align: center;
  width: 420px;

  box-shadow:
      0 25px 60px rgba(0,0,0,0.15),
      0 8px 20px rgba(0,0,0,0.08);

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
      0 0 0 10px rgba(34,197,94,0.15),
      0 15px 30px rgba(34,197,94,0.35);

  animation: pop 0.5s ease;
}

.check-icon {
  width: 40px;
  height: 40px;
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
  padding: 14px;
  border-radius: 10px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary {
  background: linear-gradient(135deg,#3b82f6,#2563eb);
  color: white;
}

.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(37,99,235,0.3);
}

.secondary {
  background: #f3f4f6;
  color: #374151;
}

.secondary:hover {
  background: #e5e7eb;
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
.check-icon {
  width: 70px;
  height: 70px;
}

.check-circle {
  stroke: #22c55e;
  stroke-width: 3;
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  animation: circle 0.6s ease forwards;
}

.check-path {
  stroke: #22c55e;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;

  stroke-dasharray: 48;
  stroke-dashoffset: 48;

  animation: check 0.4s 0.6s ease forwards;
}

@keyframes circle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes check {
  to {
    stroke-dashoffset: 0;
  }
}

</style>
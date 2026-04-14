<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  buildingName: string
  floorNumber: number
  roomNumber: string
}>()

defineEmits<{
  (e: 'change-room'): void
  (e: 'evict'): void
}>()

const residenceLine = computed(
  () => `${props.buildingName}, ${props.floorNumber} этаж, комната ${props.roomNumber}`
)
</script>

<template>
  <section class="residence-page">
    <div class="hero">
      <div>
        <p class="eyebrow">Student / Housing</p>
        <h1>Проживание</h1>
        <p class="subtitle">
          Комната закреплена за вами. Здесь можно быстро запросить перевод в
          другую комнату или оформить выселение без отдельного обращения в
          администрацию.
        </p>

        <div class="summary-card">
          <span class="detail-label">Текущая комната</span>
          <strong>{{ residenceLine }}</strong>
        </div>
      </div>
    </div>

    <div class="stats">
      <article class="stat-card">
        <span class="stat-label">Статус</span>
        <strong>Заселены</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">Корпус</span>
        <strong>{{ buildingName }}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">Этаж</span>
        <strong>{{ floorNumber }}</strong>
      </article>

      <article class="stat-card">
        <span class="stat-label">Комната</span>
        <strong>{{ roomNumber }}</strong>
      </article>
    </div>

    <div class="actions-grid">
      <article class="action-card">
        <span class="action-badge change">Новый запрос</span>
        <h2>Смена комнаты</h2>
        <p>
          Откроется стандартный сценарий выбора корпуса, этажа и комнаты для
          подачи новой заявки.
        </p>

        <button
          type="button"
          class="action-btn action-btn--primary"
          @click="$emit('change-room')"
        >
          Поменять комнату
        </button>
      </article>

      <article class="action-card">
        <span class="action-badge evict">Подтверждение</span>
        <h2>Выселение</h2>
        <p>
          Если проживание завершено, отправьте запрос на выезд. Он будет
          обработан администрацией отдельно.
        </p>

        <button
          type="button"
          class="action-btn action-btn--danger"
          @click="$emit('evict')"
        >
          Выселиться
        </button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.residence-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  color: #172033;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  padding: 28px 32px;
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(91, 79, 255, 0.16), transparent 28%),
    linear-gradient(135deg, #ffffff 0%, #f3f2ff 100%);
  border: 1px solid #ddd9ff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5b4fff;
}

h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.05;
  font-weight: 800;
}

.subtitle {
  max-width: 760px;
  margin: 12px 0 0;
  line-height: 1.6;
  color: #526075;
}

.summary-card {
  max-width: 760px;
  margin-top: 20px;
  padding: 18px 20px;
  border-radius: 22px;
  background: #ffffff;
  border: 1px solid #ddd9ff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.detail-label,
.stat-label {
  display: block;
  margin-bottom: 10px;
  color: #68768b;
  font-size: 13px;
  font-weight: 700;
}

.summary-card strong {
  display: block;
  color: #172033;
  font-size: 24px;
  line-height: 1.35;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card,
.action-card {
  background: #fff;
  border: 1px solid #dbe5f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.stat-card {
  padding: 18px 20px;
  border-radius: 22px;
}

.stat-card strong {
  display: block;
  font-size: 28px;
  line-height: 1.2;
  color: #172033;
  word-break: break-word;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.action-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: 28px;
}

.action-badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.action-badge.change {
  background: rgba(91, 79, 255, 0.12);
  color: #4c44d4;
}

.action-badge.evict {
  background: #fef2f2;
  color: #b91c1c;
}

.action-card h2 {
  margin: 0;
  font-size: 26px;
  line-height: 1.15;
  font-weight: 800;
  color: #172033;
}

.action-card p {
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
  color: #526075;
  flex: 1;
}

.action-btn {
  min-height: 48px;
  padding: 12px 18px;
  border: none;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
}

.action-btn--primary {
  background: #5b4fff;
  color: #fff;
}

.action-btn--danger {
  background: #172033;
  color: #fff;
}

@media (max-width: 1200px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .residence-page {
    gap: 18px;
  }

  .hero {
    padding: 24px 20px;
    border-radius: 24px;
  }

  h1 {
    font-size: 28px;
  }

  .summary-card strong {
    font-size: 20px;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .action-card {
    padding: 22px 20px;
    border-radius: 24px;
  }

  .action-card h2 {
    font-size: 24px;
  }
}
</style>

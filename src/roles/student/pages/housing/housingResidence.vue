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
  <div class="residence-layout">
    <section class="hero-card">
      <div class="hero-copy">
        <p class="eyebrow">Student / Housing</p>
        <span class="status-pill">Активное проживание</span>
        <h2 class="hero-title">Вы уже заселены</h2>
        <p class="hero-description">
          Комната закреплена за вами. Здесь можно быстро запросить перевод в
          другую комнату или оформить выселение без отдельного обращения в
          администрацию.
        </p>

        <div class="address-card">
          <span class="address-label">Текущая локация</span>
          <strong>{{ residenceLine }}</strong>
        </div>
      </div>

      <div class="hero-summary">
        <article class="summary-tile summary-tile--wide">
          <span class="summary-label">Корпус</span>
          <strong>{{ buildingName }}</strong>
        </article>

        <div class="summary-grid">
          <article class="summary-tile">
            <span class="summary-label">Этаж</span>
            <strong>{{ floorNumber }}</strong>
          </article>

          <article class="summary-tile">
            <span class="summary-label">Комната</span>
            <strong>{{ roomNumber }}</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="residence-actions">
      <button
        type="button"
        class="action-card action-card--change"
        @click="$emit('change-room')"
      >
        <span class="action-tag">Room switch</span>
        <h3>Поменять комнату</h3>
        <p>
          Откроется новый сценарий выбора корпуса, этажа и комнаты. Текущий
          статус проживания останется активным до решения по запросу.
        </p>

        <div class="action-footer">
          <span class="action-chip">Новый запрос</span>
          <span class="action-link">Открыть</span>
        </div>
      </button>

      <button
        type="button"
        class="action-card action-card--evict"
        @click="$emit('evict')"
      >
        <span class="action-tag">Checkout</span>
        <h3>Выселиться</h3>
        <p>
          Если проживание завершено, отправьте запрос на выезд. Подтверждение
          будет обработано администрацией отдельно.
        </p>

        <div class="action-footer">
          <span class="action-chip">Подтверждение</span>
          <span class="action-link">Продолжить</span>
        </div>
      </button>
    </section>

    <section class="info-strip">
      <article class="info-card">
        <span class="info-label">Статус</span>
        <strong>Проживание активно</strong>
        <p>Комната уже закреплена, а действия доступны прямо из кабинета.</p>
      </article>

      <article class="info-card">
        <span class="info-label">Расположение</span>
        <strong>{{ buildingName }}</strong>
        <p>{{ floorNumber }} этаж, комната {{ roomNumber }}</p>
      </article>

      <article class="info-card">
        <span class="info-label">Следующий шаг</span>
        <strong>Смена комнаты или выезд</strong>
        <p>Обе операции запускаются отсюда и подтверждаются отдельно.</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
.residence-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: #12203a;
}

.hero-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) 360px;
  gap: 24px;
  padding: 34px;
  border-radius: 34px;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(255, 205, 84, 0.22), transparent 24%),
    radial-gradient(circle at bottom left, rgba(148, 204, 255, 0.14), transparent 30%),
    linear-gradient(140deg, #12294b 0%, #1b3f74 52%, #3d57c5 100%);
  box-shadow: 0 28px 70px rgba(18, 41, 75, 0.24);
}

.hero-card::before {
  content: '';
  position: absolute;
  right: -100px;
  top: -120px;
  width: 280px;
  height: 280px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.hero-card::after {
  content: '';
  position: absolute;
  left: 45%;
  bottom: -96px;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
}

.hero-copy,
.hero-summary {
  position: relative;
  z-index: 1;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  margin-top: 18px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.hero-title {
  margin: 18px 0 0;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1.02;
  font-weight: 800;
  color: #ffffff;
}

.hero-description {
  max-width: 620px;
  margin: 18px 0 0;
  color: rgba(240, 245, 255, 0.82);
  font-size: 16px;
  line-height: 1.7;
}

.address-card {
  max-width: 620px;
  margin-top: 28px;
  padding: 20px 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
}

.address-label,
.summary-label {
  display: block;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.address-label {
  color: rgba(255, 255, 255, 0.7);
}

.address-card strong {
  display: block;
  color: #ffffff;
  font-size: 24px;
  line-height: 1.35;
}

.hero-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.summary-tile {
  padding: 22px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(12px);
}

.summary-tile--wide {
  min-height: 154px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.summary-tile strong {
  display: block;
  color: #ffffff;
  font-size: 28px;
  line-height: 1.15;
}

.summary-label {
  color: rgba(255, 255, 255, 0.68);
}

.residence-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.action-card {
  position: relative;
  min-height: 310px;
  padding: 30px;
  border: none;
  border-radius: 32px;
  cursor: pointer;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.action-card::before {
  content: '';
  position: absolute;
  inset: auto -48px -60px auto;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.26);
  pointer-events: none;
}

.action-card:hover {
  transform: translateY(-6px);
}

.action-card--change {
  background: linear-gradient(135deg, #ecfff2 0%, #d8f4e5 100%);
  color: #103527;
  box-shadow: 0 20px 44px rgba(16, 53, 39, 0.12);
}

.action-card--evict {
  background: linear-gradient(135deg, #fff5ef 0%, #f4d8ce 100%);
  color: #4a241c;
  box-shadow: 0 20px 44px rgba(74, 36, 28, 0.12);
}

.action-tag {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.48);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.action-card h3,
.action-card p,
.action-footer {
  position: relative;
  z-index: 1;
}

.action-card h3 {
  margin: 18px 0 0;
  font-size: clamp(30px, 3vw, 42px);
  line-height: 1.02;
  font-weight: 800;
}

.action-card p {
  max-width: 35ch;
  margin: 14px 0 0;
  font-size: 16px;
  line-height: 1.65;
  color: inherit;
}

.action-footer {
  margin-top: 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.action-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(18, 32, 58, 0.08);
  font-size: 13px;
  font-weight: 700;
}

.action-link {
  font-size: 15px;
  font-weight: 800;
}

.info-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.info-card {
  padding: 22px 24px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid #d8e2f0;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}

.info-label {
  display: block;
  margin-bottom: 12px;
  color: #66758b;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.info-card strong {
  display: block;
  font-size: 24px;
  line-height: 1.2;
}

.info-card p {
  margin: 12px 0 0;
  color: #66758b;
  line-height: 1.6;
}

@media (max-width: 1200px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .summary-tile--wide {
    min-height: auto;
  }
}

@media (max-width: 960px) {
  .residence-actions {
    grid-template-columns: 1fr;
  }

  .info-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .hero-card {
    padding: 24px 20px;
    border-radius: 28px;
  }

  .address-card strong,
  .summary-tile strong,
  .info-card strong {
    font-size: 22px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .action-card {
    min-height: 260px;
    padding: 24px 22px;
    border-radius: 28px;
  }

  .action-card h3 {
    font-size: 30px;
  }

  .info-card {
    padding: 20px;
  }
}
</style>

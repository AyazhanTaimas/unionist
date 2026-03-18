<script setup lang="ts">
defineProps<{
  open: boolean
  evicting: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <transition name="modal-fade">
    <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal confirm-modal">
        <h3 class="confirm-title">Вы уверены что хотите выселиться?</h3>

        <div class="confirm-actions">
          <button class="confirm-btn confirm-btn--cancel" @click="$emit('close')">
            Отмена
          </button>

          <button
            class="confirm-btn confirm-btn--accept"
            :disabled="evicting"
            @click="$emit('confirm')"
          >
            {{ evicting ? 'Отправка...' : 'Да' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal {
  position: relative;
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 24px;
  padding: 28px 24px 22px;
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.18);
}

.confirm-modal {
  max-width: 560px;
  padding: 32px 24px 18px;
}

.confirm-title {
  margin: 0 0 26px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.confirm-btn {
  height: 52px;
  border: none;
  border-radius: 18px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.confirm-btn--cancel {
  background: #d9d7d7;
  color: #ffffff;
}

.confirm-btn--accept {
  background: #f5e1de;
  color: #111827;
}

.confirm-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 700px) {
  .confirm-actions {
    grid-template-columns: 1fr;
  }
}
</style>
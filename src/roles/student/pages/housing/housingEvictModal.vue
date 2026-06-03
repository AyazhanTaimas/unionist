<script setup lang="ts">
import { useI18n } from '@/app/i18n'

defineProps<{
  open: boolean
  evicting: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const { t } = useI18n()
</script>

<template>
  <transition name="modal-fade">
    <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal confirm-modal">
        <span class="modal-tag">{{ t('pages.housing.confirmation') }}</span>
        <h3 class="confirm-title">{{ t('pages.housing.confirmEvict') }}</h3>
        <p class="confirm-copy">
          {{ t('pages.housing.confirmEvictDescription') }}
        </p>

        <div class="confirm-actions">
          <button class="confirm-btn confirm-btn--cancel" @click="$emit('close')">
            {{ t('common.cancel') }}
          </button>

          <button
            class="confirm-btn confirm-btn--accept"
            :disabled="evicting"
            @click="$emit('confirm')"
          >
            {{ evicting ? t('pages.housing.submitting') : t('common.yes') }}
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
  background: rgba(9, 17, 32, 0.42);
  backdrop-filter: blur(10px);
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
  background:
    radial-gradient(circle at top right, rgba(255, 205, 84, 0.18), transparent 26%),
    linear-gradient(145deg, #ffffff 0%, #f4f7fb 100%);
  border: 1px solid rgba(203, 213, 225, 0.9);
  border-radius: 28px;
  padding: 28px 24px 22px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
}

.confirm-modal {
  max-width: 560px;
  padding: 32px 28px 22px;
}

.modal-tag {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3447c2;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.confirm-title {
  margin: 18px 0 0;
  font-size: 30px;
  line-height: 1.1;
  font-weight: 700;
  color: #111827;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.confirm-copy {
  margin: 14px 0 28px;
  max-width: 44ch;
  color: #5b677a;
  font-size: 15px;
  line-height: 1.65;
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
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease,
    box-shadow 0.2s ease;
  font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.confirm-btn--cancel {
  background: #e9eef5;
  color: #23314c;
}

.confirm-btn--accept {
  background: linear-gradient(135deg, #12294b 0%, #3551cb 100%);
  color: #ffffff;
}

.confirm-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
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

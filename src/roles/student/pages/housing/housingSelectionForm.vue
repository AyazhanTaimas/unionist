<script setup lang="ts">
import { useI18n } from '@/app/i18n'
import type { Building, Floor, Room } from './model/types'

defineProps<{
  title: string
  hasSubmitted: boolean
  error: string | null
  buildings: Building[]
  floors: Floor[]
  rooms: Room[]
  selectedBuildingId: number | null
  selectedFloorId: number | null
  selectedRoomId: number | null
  loadingBuildings: boolean
  loadingFloors: boolean
  loadingRooms: boolean
  canSubmit: boolean
  submitButtonText: string
  submitting: boolean
  changingRoom: boolean
  isChangingRoom: boolean
}>()

defineEmits<{
  (e: 'update:selectedBuildingId', value: number | null): void
  (e: 'update:selectedFloorId', value: number | null): void
  (e: 'update:selectedRoomId', value: number | null): void
  (e: 'submit'): void
  (e: 'cancel-change'): void
}>()

const { t } = useI18n()

function getBuildingLabel(building: Building) {
  if (building.name) {
    return `${building.name} (${building.address})`
  }

  return building.address
}
</script>

<template>
  <div>
    <h2 class="title">{{ title }}</h2>

    <div v-if="hasSubmitted" class="request-info">
      {{ t('pages.housing.requestAlreadySent') }}
    </div>

    <div v-if="error" class="error-box">
      {{ error }}
    </div>

    <div class="content-grid">
      <div class="form-card">
        <div class="field">
          <label class="field__label">{{ t('pages.housing.building') }}</label>
          <select
            :value="selectedBuildingId ?? ''"
            class="field__input"
            :disabled="loadingBuildings"
            @change="$emit('update:selectedBuildingId', Number(($event.target as HTMLSelectElement).value) || null)"
          >
            <option value="" disabled>{{ t('pages.housing.selectBuilding') }}</option>
            <option v-for="b in buildings" :key="b.id" :value="b.id">
              {{ getBuildingLabel(b) }}
            </option>
          </select>
        </div>

        <div class="field">
          <label class="field__label">{{ t('pages.housing.floorLabel') }}</label>
          <select
            :value="selectedFloorId ?? ''"
            class="field__input"
            :disabled="!selectedBuildingId || loadingFloors"
            @change="$emit('update:selectedFloorId', Number(($event.target as HTMLSelectElement).value) || null)"
          >
            <option value="" disabled>{{ t('pages.housing.selectFloor') }}</option>
            <option v-for="f in floors" :key="f.id" :value="f.id">
              {{ t('pages.housing.floorOption', { floor: f.floor_number }) }}
            </option>
          </select>
        </div>

        <div class="field">
          <label class="field__label">{{ t('pages.housing.room') }}</label>
          <select
            :value="selectedRoomId ?? ''"
            class="field__input"
            :disabled="!selectedFloorId || loadingRooms"
            @change="$emit('update:selectedRoomId', Number(($event.target as HTMLSelectElement).value) || null)"
          >
            <option value="" disabled>{{ t('pages.housing.selectRoom') }}</option>
            <option v-for="r in rooms" :key="r.id" :value="r.id">
              {{ r.room_number }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button
            class="submit-btn"
            :class="{ active: canSubmit }"
            :disabled="!canSubmit || submitting || changingRoom"
            @click="$emit('submit')"
          >
            {{ submitButtonText }}
          </button>

          <button
            v-if="isChangingRoom"
            class="secondary-btn"
            type="button"
            @click="$emit('cancel-change')"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>

      <div class="preview-card">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.title {
  margin: 0 0 20px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.request-info,
.error-box {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  font-size: 15px;
}

.request-info {
  background: #f0fdf4;
  color: #15803d;
}

.error-box {
  background: #fff1f2;
  color: #be123c;
}

.content-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  align-items: stretch;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f8fafc;
  border-radius: 24px;
  padding: 22px;
  min-height: 420px;
}

.preview-card {
  min-height: 420px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field__label {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.field__input {
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: 1px solid #d1d5db;
  padding: 0 14px;
  background: #ffffff;
  font-size: 15px;
  color: #111827;
  outline: none;
}

.field__input:focus {
  border-color: #5b4fff;
  box-shadow: 0 0 0 3px rgba(91, 79, 255, 0.1);
}

.field__input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
}

.form-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.submit-btn,
.secondary-btn {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.submit-btn {
  background: #d8d7ff;
  color: #ffffff;
}

.submit-btn.active {
  background: #5b4fff;
}

.submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.secondary-btn {
  background: #eceff3;
  color: #374151;
}

@media (max-width: 1100px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .title {
    font-size: 24px;
  }
}
</style>

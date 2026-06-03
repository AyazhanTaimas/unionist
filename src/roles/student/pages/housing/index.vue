<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/app/i18n'
import HousingResidenceView from './housingResidence.vue'
import HousingSelectionForm from './housingSelectionForm.vue'
import HousingEvictModal from './housingEvictModal.vue'
import HousingPreview from './housingPreview.vue'
import { useHousingPage } from './model/useHousingPage'

const {
  buildings,
  floors,
  rooms,
  selectedBuildingId,
  selectedFloorId,
  selectedRoomId,
  loadingBuildings,
  loadingFloors,
  loadingRooms,
  loadingStatus,
  submitting,
  changingRoom,
  evicting,
  error,
  hasSubmitted,
  showSuccessModal,
  successMessage,
  showEvictModal,
  isChangingRoom,
  canSubmit,
  currentView,
  selectedBuilding,
  hasActiveResidence,
  currentResidence,
  submitButtonText,
  closeSuccessModal,
  openChangeRoomMode,
  cancelChangeRoomMode,
  openEvictModal,
  closeEvictModal,
  confirmEviction,
  handleSubmit,
  setSelectedBuildingId,
  setSelectedFloorId,
  setSelectedRoomId,
} = useHousingPage()

const { t } = useI18n()

const showResidenceDashboard = computed(
  () => hasActiveResidence.value && !isChangingRoom.value && !!currentResidence.value
)
</script>

<template>
  <div
    class="accommodation-page"
    :class="{ 'accommodation-page--residence': showResidenceDashboard }"
  >
    <div
      class="card-wrapper"
      :class="{ 'card-wrapper--residence': showResidenceDashboard }"
    >
      <div v-if="!showResidenceDashboard" class="accent-line"></div>

      <div class="card" :class="{ 'card--residence': showResidenceDashboard }">
        <template v-if="loadingStatus">
          <div class="loading-box">{{ t('common.loadingData') }}</div>
        </template>

        <template v-else-if="showResidenceDashboard && currentResidence">
          <HousingResidenceView
            :building-name="currentResidence.building_name"
            :floor-number="currentResidence.floor_number"
            :room-number="currentResidence.room_number"
            @change-room="openChangeRoomMode"
            @evict="openEvictModal"
          />
        </template>

        <template v-else>
          <HousingSelectionForm
            :title="isChangingRoom ? t('pages.housing.changeSelectionTitle') : t('pages.housing.selectionTitle')"
            :has-submitted="hasSubmitted"
            :error="error"
            :buildings="buildings"
            :floors="floors"
            :rooms="rooms"
            :selected-building-id="selectedBuildingId"
            :selected-floor-id="selectedFloorId"
            :selected-room-id="selectedRoomId"
            :loading-buildings="loadingBuildings"
            :loading-floors="loadingFloors"
            :loading-rooms="loadingRooms"
            :can-submit="canSubmit"
            :submit-button-text="submitButtonText"
            :submitting="submitting"
            :changing-room="changingRoom"
            :is-changing-room="isChangingRoom"
            @update:selected-building-id="setSelectedBuildingId"
            @update:selected-floor-id="setSelectedFloorId"
            @update:selected-room-id="setSelectedRoomId"
            @submit="handleSubmit"
            @cancel-change="cancelChangeRoomMode"
          >
            <HousingPreview
              :current-view="currentView"
              :selected-building="selectedBuilding"
            />
          </HousingSelectionForm>
        </template>
      </div>
    </div>

    <HousingSuccessModal
      :open="showSuccessModal"
      :message="successMessage"
      @close="closeSuccessModal"
    />

    <HousingEvictModal
      :open="showEvictModal"
      :evicting="evicting"
      @close="closeEvictModal"
      @confirm="confirmEviction"
    />
  </div>
</template>

<style scoped>
.accommodation-page {
  width: 100%;
  min-height: 100%;
  margin-top: 72px;
}

.accommodation-page--residence {
  padding-bottom: 12px;
}

.card-wrapper {
  position: relative;
  width: 100%;
}

.accent-line {
  position: absolute;
  left: 18px;
  top: 56px;
  bottom: 24px;
  width: 4px;
  border-radius: 12px;
  background: #5347ff;
  margin-top: -25px;
}

.card {
  margin-left: 18px;
  background: #ffffff;
  border: 1px solid #d9dde7;
  border-radius: 34px;
  padding: 22px 26px 26px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
}

.card--residence {
  margin-left: 0;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.loading-box {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  font-size: 15px;
  background: #f4f7fb;
  color: #334155;
}

@media (max-width: 900px) {
  .accommodation-page {
    margin-top: 56px;
  }
}

@media (max-width: 700px) {
  .card {
    margin-left: 0;
    padding: 18px;
    border-radius: 24px;
  }

  .card--residence {
    padding: 0;
    border-radius: 0;
  }

  .accent-line {
    display: none;
  }
}
</style>

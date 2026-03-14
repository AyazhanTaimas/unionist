<script setup lang="ts">
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
  hasActiveResidence,
  residenceTitle,
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
</script>

<template>
  <div class="accommodation-page">
    <div class="card-wrapper">
      <div class="accent-line"></div>

      <div class="card">
        <template v-if="loadingStatus">
          <div class="loading-box">Загрузка данных...</div>
        </template>

        <template v-else-if="hasActiveResidence && !isChangingRoom">
          <HousingResidenceView
            :residence-title="residenceTitle"
            @change-room="openChangeRoomMode"
            @evict="openEvictModal"
          />
        </template>

        <template v-else>
          <HousingSelectionForm
            :title="isChangingRoom ? 'Смена комнаты' : 'Выбор комнаты'"
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
            <HousingPreview :current-view="currentView" />
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
  margin-top: 70px;
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

.loading-box {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  font-size: 15px;
  background: #f4f7fb;
  color: #334155;
}

@media (max-width: 700px) {
  .card {
    margin-left: 0;
    padding: 18px;
    border-radius: 24px;
  }

  .accent-line {
    display: none;
  }
}
</style>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getBuildings, getFloors, getRooms } from './housingApi'
import type { Building, Floor, Room } from './types'
import { createLiveRequest } from './request/requestApi'
import { createChangeRoomRequest } from './changeRoomApi'
import { getHousingStatus } from './statusApi'

import K2 from '@/assets/K2.png'
import K3 from '@/assets/K3.png'
import K4 from '@/assets/K4.png'

// ----------------------
// TYPES
// ----------------------
type View = 'map' | 'floor' | 'room' | 'roommap'

interface CurrentResidence {
  building_name: string
  floor_number: number
  room_number: string
}

// ----------------------
// STATE
// ----------------------
const buildings = ref<Building[]>([])
const floors = ref<Floor[]>([])
const rooms = ref<Room[]>([])

const selectedBuildingId = ref<number | null>(null)
const selectedFloorId = ref<number | null>(null)
const selectedRoomId = ref<number | null>(null)

const loadingBuildings = ref(false)
const loadingFloors = ref(false)
const loadingRooms = ref(false)
const loadingStatus = ref(false)
const submitting = ref(false)
const changingRoom = ref(false)
const evicting = ref(false)

const error = ref<string | null>(null)

const hasSubmitted = ref(false)
const currentResidence = ref<CurrentResidence | null>(null)

const showSuccessModal = ref(false)
const successMessage = ref('')

const showEvictModal = ref(false)

const isChangingRoom = ref(false)

// ----------------------
// COMPUTED
// ----------------------
const selectedBuilding = computed(() =>
  buildings.value.find(b => b.id === selectedBuildingId.value) ?? null
)

const selectedFloor = computed(() =>
  floors.value.find(f => f.id === selectedFloorId.value) ?? null
)

const selectedRoom = computed(() =>
  rooms.value.find(r => r.id === selectedRoomId.value) ?? null
)

const canSubmit = computed(() =>
  !!(selectedBuilding.value && selectedFloor.value && selectedRoom.value)
)

const currentView = computed<View>(() => {
  if (selectedRoom.value) return 'roommap'
  if (selectedFloor.value) return 'room'
  if (selectedBuilding.value) return 'floor'
  return 'map'
})

const hasActiveResidence = computed(() => !!currentResidence.value)

const residenceTitle = computed(() => {
  if (!currentResidence.value) return ''
  return `Ваша комната: ${currentResidence.value.building_name}, этаж ${currentResidence.value.floor_number}, ${currentResidence.value.room_number} комната`
})

const submitButtonText = computed(() => {
  if (submitting.value) return 'Отправка...'
  if (changingRoom.value) return 'Отправка...'
  if (isChangingRoom.value) return 'Поменять комнату'
  return 'Заселиться'
})

// ----------------------
// HELPERS
// ----------------------
function getUserId(): number | null {
  const rawUser = localStorage.getItem('user')

  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser)
      if (parsed?.id) return Number(parsed.id)
    } catch {
      // ignore
    }
  }

  const rawId =
    localStorage.getItem('user_id') ||
    localStorage.getItem('userId') ||
    sessionStorage.getItem('user_id') ||
    sessionStorage.getItem('userId')

  if (rawId) {
    const id = Number(rawId)
    return Number.isNaN(id) ? null : id
  }

  return null
}

function resetSelection() {
  selectedBuildingId.value = null
  selectedFloorId.value = null
  selectedRoomId.value = null
  floors.value = []
  rooms.value = []
}

function closeSuccessModal() {
  showSuccessModal.value = false
}

function openChangeRoomMode() {
  isChangingRoom.value = true
  resetSelection()
  hasSubmitted.value = false
}

function cancelChangeRoomMode() {
  isChangingRoom.value = false
  resetSelection()
}

function openEvictModal() {
  showEvictModal.value = true
}

function closeEvictModal() {
  showEvictModal.value = false
}

async function confirmEviction() {
  try {
    evicting.value = true

    // TODO:
    // Когда появится API на выселение — вставь сюда запрос.
    // Например:
    // await evictFromRoom()

    showEvictModal.value = false
    successMessage.value = 'Запрос на выселение отправлен'
    showSuccessModal.value = true
  } catch (e) {
    console.error(e)
    alert('Не удалось отправить запрос на выселение')
  } finally {
    evicting.value = false
  }
}

// ----------------------
// STATUS
// ----------------------
async function loadStatus() {
  const userId = getUserId()
  if (!userId) {
    currentResidence.value = null
    return
  }

  loadingStatus.value = true

  try {
    const res = await getHousingStatus(userId)

    if (res?.data?.is_living && res.data.settlement) {
      const settlement = res.data.settlement

      currentResidence.value = {
        building_name:
          settlement.room?.floor?.building?.address ?? 'Корпус',
        floor_number:
          settlement.room?.floor?.floor_number ?? 0,
        room_number:
          settlement.room?.room_number ?? '',
      }

      hasSubmitted.value = false
      isChangingRoom.value = false
    } else {
      currentResidence.value = null
    }
  } catch (e) {
    console.error(e)
    currentResidence.value = null
  } finally {
    loadingStatus.value = false
  }
}

// ----------------------
// LOAD BUILDINGS
// ----------------------
onMounted(async () => {
  loadingBuildings.value = true
  error.value = null

  try {
    buildings.value = await getBuildings()
  } catch (e) {
    console.error(e)
    error.value = 'Не удалось загрузить корпуса'
    buildings.value = []
  } finally {
    loadingBuildings.value = false
  }

  await loadStatus()
})

// ----------------------
// WATCH BUILDING
// ----------------------
watch(selectedBuildingId, async (buildingId) => {
  selectedFloorId.value = null
  selectedRoomId.value = null
  floors.value = []
  rooms.value = []

  if (!buildingId) return

  loadingFloors.value = true

  try {
    floors.value = await getFloors(buildingId)
  } catch (e) {
    console.error(e)
    floors.value = []
  } finally {
    loadingFloors.value = false
  }
})

// ----------------------
// WATCH FLOOR
// ----------------------
watch(selectedFloorId, async (floorId) => {
  selectedRoomId.value = null
  rooms.value = []

  if (!floorId) return

  loadingRooms.value = true

  try {
    rooms.value = await getRooms(floorId)
  } catch (e) {
    console.error(e)
    rooms.value = []
  } finally {
    loadingRooms.value = false
  }
})

// ----------------------
// SUBMIT
// ----------------------
async function submitRequest() {
  if (!selectedRoom.value) return

  try {
    submitting.value = true

    const res = await createLiveRequest(selectedRoom.value.id)

    hasSubmitted.value = true
    successMessage.value = res?.message || 'Заявка на заселение успешно отправлена'
    showSuccessModal.value = true
  } catch (e: any) {
    console.error(e)

    const status = e?.response?.status
    const data = e?.response?.data

    if (status === 422) {
      alert(
        data?.errors?.preferred_room_id?.[0] ||
          data?.message ||
          'Ошибка валидации'
      )
      return
    }

    alert(data?.message || 'Ошибка при отправке заявки')
  } finally {
    submitting.value = false
  }
}

async function submitChangeRoom() {
  if (!selectedRoom.value) return

  try {
    changingRoom.value = true

    const res = await createChangeRoomRequest(selectedRoom.value.id)

    successMessage.value = res?.message || 'Заявка на смену комнаты отправлена'
    showSuccessModal.value = true
    isChangingRoom.value = false
    hasSubmitted.value = true
    resetSelection()
  } catch (e: any) {
    console.error(e)

    const status = e?.response?.status
    const data = e?.response?.data

    if (status === 422) {
      alert(
        data?.errors?.preferred_room_id?.[0] ||
          data?.message ||
          'Ошибка валидации'
      )
      return
    }

    alert(data?.message || 'Ошибка при отправке заявки')
  } finally {
    changingRoom.value = false
  }
}

async function handleSubmit() {
  if (isChangingRoom.value) {
    await submitChangeRoom()
    return
  }

  await submitRequest()
}
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
          <div class="residence-layout">
            <div class="residence-title-box">
              <h2 class="residence-title">{{ residenceTitle }}</h2>
            </div>

            <div class="residence-actions">
              <button class="action-tile action-tile--green" @click="openChangeRoomMode">
                Поменять комнату
              </button>

              <button class="action-tile action-tile--pink" @click="openEvictModal">
                Выселиться
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <h2 class="title">
            {{ isChangingRoom ? 'Смена комнаты' : 'Выбор комнаты' }}
          </h2>

          <div v-if="hasSubmitted" class="request-info">
            Заявка уже отправлена.
          </div>

          <div v-if="error" class="error-box">
            {{ error }}
          </div>

          <div class="content-grid">
            <div class="form-card">
              <div class="field">
                <label class="field__label">Корпус</label>
                <select
                  v-model.number="selectedBuildingId"
                  class="field__input"
                  :disabled="loadingBuildings"
                >
                  <option :value="null" disabled>Выберите корпус</option>
                  <option v-for="b in buildings" :key="b.id" :value="b.id">
                    {{ b.address }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label class="field__label">Этаж</label>
                <select
                  v-model.number="selectedFloorId"
                  class="field__input"
                  :disabled="!selectedBuildingId || loadingFloors"
                >
                  <option :value="null" disabled>Выберите этаж</option>
                  <option v-for="f in floors" :key="f.id" :value="f.id">
                    {{ f.floor_number }} этаж
                  </option>
                </select>
              </div>

              <div class="field">
                <label class="field__label">Комната</label>
                <select
                  v-model.number="selectedRoomId"
                  class="field__input"
                  :disabled="!selectedFloorId || loadingRooms"
                >
                  <option :value="null" disabled>Выберите комнату</option>
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
                  @click="handleSubmit"
                >
                  {{ submitButtonText }}
                </button>

                <button
                  v-if="isChangingRoom"
                  class="secondary-btn"
                  type="button"
                  @click="cancelChangeRoomMode"
                >
                  Отмена
                </button>
              </div>
            </div>

            <div class="image-wrapper">
              <transition name="fade" mode="out-in">
                <iframe
                  v-if="currentView === 'map'"
                  key="map"
                  src="https://yandex.kz/map-widget/v1/?um=constructor%3A1f1d8b93c7c1f9f2f7b6b0c4a3c8example"
                  frameborder="0"
                  allowfullscreen
                ></iframe>

                <img
                  v-else-if="currentView === 'floor'"
                  key="k2"
                  :src="K2"
                  alt="Building preview"
                />

                <img
                  v-else-if="currentView === 'room'"
                  key="k3"
                  :src="K3"
                  alt="Floor preview"
                />

                <img
                  v-else-if="currentView === 'roommap'"
                  key="k4"
                  :src="K4"
                  alt="Room preview"
                />
              </transition>
            </div>
          </div>
        </template>
      </div>
    </div>

    <transition name="modal-fade">
      <div v-if="showSuccessModal" class="modal-overlay" @click.self="closeSuccessModal">
        <div class="modal">
          <button class="modal-close" @click="closeSuccessModal">×</button>
          <h3 class="modal-title">Успешно</h3>
          <p class="modal-text">{{ successMessage }}</p>
          <button class="modal-primary-btn" @click="closeSuccessModal">
            Понятно
          </button>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showEvictModal" class="modal-overlay" @click.self="closeEvictModal">
        <div class="modal confirm-modal">
          <h3 class="confirm-title">Вы уверены что хотите выселиться?</h3>

          <div class="confirm-actions">
            <button class="confirm-btn confirm-btn--cancel" @click="closeEvictModal">
              Отмена
            </button>

            <button
              class="confirm-btn confirm-btn--accept"
              :disabled="evicting"
              @click="confirmEviction"
            >
              {{ evicting ? 'Отправка...' : 'Да' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.accommodation-page {
  width: 100%;
  min-height: 100%;
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

.title {
  margin: 0 0 20px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.loading-box,
.error-box,
.request-info {
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  font-size: 15px;
}

.loading-box {
  background: #f4f7fb;
  color: #334155;
}

.error-box {
  background: #fff1f2;
  color: #be123c;
}

.request-info {
  background: #f0fdf4;
  color: #15803d;
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

.secondary-btn:hover {
  opacity: 0.92;
}

.image-wrapper {
  max-height: 400px;
  border-radius: 26px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper iframe,
.image-wrapper img {
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: cover;
  display: block;
  border: none;
}

.residence-layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.residence-title-box {
  background: #f4fbfb;
  border-radius: 28px;
  padding: 36px 28px;
}

.residence-title {
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
    font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

}

.residence-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  min-height: 280px;
}

.action-tile {
  border: none;
  border-radius: 30px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  cursor: pointer;
  transition: 0.2s ease;
  min-height: 280px;
    font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

}

.action-tile:hover {
  transform: translateY(-2px);
}

.action-tile--green {
  background: #dff3e3;
}

.action-tile--pink {
  background: #f8e7e7;
}

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

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  color: #94a3b8;
    font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

}

.modal-title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
    font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

}

.modal-text {
  margin: 0 0 18px;
  font-size: 16px;
  line-height: 1.5;
  color: #475569;
    font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

}

.modal-primary-btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 16px;
  background: #5b4fff;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
    font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

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

.fade-enter-active,
.fade-leave-active,
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 1100px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .residence-actions {
    grid-template-columns: 1fr;
  }

  .action-tile {
    min-height: 180px;
    font-size: 24px;
      font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;

  }
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

  .title,
  .residence-title {
    font-size: 24px;
  }

  .confirm-actions {
    grid-template-columns: 1fr;
  }

  .residence-title-box {
    padding: 24px 20px;
  }
}
</style>

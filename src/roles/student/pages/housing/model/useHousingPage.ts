import { ref, computed, watch, onMounted } from 'vue'
import { getBuildings, getFloors, getRooms } from '../housingApi'
import { createLiveRequest } from '../request/requestApi'
import { createChangeRoomRequest } from '../changeRoomApi'
import { getHousingStatus } from '../statusApi'
import type { Building, Floor, Room, CurrentResidence, View } from './types'

export function useHousingPage() {
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

  function getUserId(): number | null {
    const rawUser = localStorage.getItem('user')

    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser)
        if (parsed?.id) return Number(parsed.id)
      } catch {
        //
      }
    }

    const rawId =
      localStorage.getItem('user_id') ||
      localStorage.getItem('userId') ||
      sessionStorage.getItem('user_id') ||
      sessionStorage.getItem('userId')

    if (!rawId) return null

    const id = Number(rawId)
    return Number.isNaN(id) ? null : id
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

  function setSelectedBuildingId(value: number | null) {
    selectedBuildingId.value = value
  }

  function setSelectedFloorId(value: number | null) {
    selectedFloorId.value = value
  }

  function setSelectedRoomId(value: number | null) {
    selectedRoomId.value = value
  }

  async function confirmEviction() {
    try {
      evicting.value = true

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
            settlement.room?.floor?.building?.name ??
            settlement.room?.floor?.building?.address ??
            'Корпус',
          floor_number: settlement.room?.floor?.floor_number ?? 0,
          room_number: settlement.room?.room_number ?? '',
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

  async function submitRequest() {
    if (!selectedRoom.value) return

    try {
      submitting.value = true

      const res = await createLiveRequest(selectedRoom.value.id)

      hasSubmitted.value = true
      successMessage.value =
        res?.message || 'Заявка на заселение успешно отправлена'
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

      successMessage.value =
        res?.message || 'Заявка на смену комнаты отправлена'
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

  return {
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
    currentResidence,
    showSuccessModal,
    successMessage,
    showEvictModal,
    isChangingRoom,
    canSubmit,
    currentView,
    selectedBuilding,
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
  }
}

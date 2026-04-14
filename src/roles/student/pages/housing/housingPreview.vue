<script setup lang="ts">
import { computed } from 'vue'
import K3 from '@/assets/K3.png'
import K4 from '@/assets/K4.png'
import type { Building, View } from './model/types'

const props = defineProps<{
  currentView: View
  selectedBuilding: Building | null
}>()

const DEFAULT_LATITUDE = 43.238949
const DEFAULT_LONGITUDE = 76.889709

const mapCoordinates = computed(() => {
  const latitude = Number(props.selectedBuilding?.latitude)
  const longitude = Number(props.selectedBuilding?.longitude)

  const hasValidLatitude = Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
  const hasValidLongitude = Number.isFinite(longitude) && longitude >= -180 && longitude <= 180

  if (hasValidLatitude && hasValidLongitude) {
    return {
      latitude,
      longitude,
      hasSelectedCoordinates: true,
    }
  }

  return {
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    hasSelectedCoordinates: false,
  }
})

const yandexMapSrc = computed(() => {
  const params = new URLSearchParams({
    ll: `${mapCoordinates.value.longitude},${mapCoordinates.value.latitude}`,
    z: mapCoordinates.value.hasSelectedCoordinates ? '16' : '11',
  })

  if (mapCoordinates.value.hasSelectedCoordinates) {
    params.set(
      'pt',
      `${mapCoordinates.value.longitude},${mapCoordinates.value.latitude},pm2rdm`
    )
  }

  return `https://yandex.kz/map-widget/v1/?${params.toString()}`
})
</script>

<template>
  <div class="image-wrapper">
    <transition name="fade" mode="out-in">
      <iframe
        v-if="currentView === 'map' || currentView === 'floor'"
        :key="currentView"
        :src="yandexMapSrc"
        frameborder="0"
        allowfullscreen
      ></iframe>

      <img
        v-else-if="currentView === 'room'"
        key="k3"
        :src="K3"
        alt="Floor preview"
      />

      <img
        v-else-if="currentView=== 'roommap'"
        key="k4"
        :src="K4"
        alt="Room preview"
      />
    </transition>
  </div>
</template>

<style scoped>
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

.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

@media (max-width: 700px) {
  .image-wrapper iframe,
  .image-wrapper img {
    min-height: 280px;
  }
}
</style>

<script setup lang="ts">
import K2 from '@/assets/K2.png'
import K3 from '@/assets/K3.png'
import K4 from '@/assets/K4.png'
import type { View } from './model/types'

defineProps<{
  currentView: View
}>()
</script>

<template>
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
        v-else
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
</style>
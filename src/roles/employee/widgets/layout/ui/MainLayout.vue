<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/roles/employee/widgets/sidebar/ui/Sidebar.vue'
import Header from '@/roles/student/widgets/header/ui/Header.vue'
import { useAppShell, useAppShellLifecycle } from '@/app/providers/layout/useAppShell'

const route = useRoute()
const { isMobileViewport, closeSidebar } = useAppShell()

useAppShellLifecycle()

watch(
  () => route.fullPath,
  () => {
    closeSidebar()
  }
)
</script>

<template>
  <div class="layout" :class="{ 'layout--mobile': isMobileViewport }">
    <Sidebar />

    <div class="main">
      <Header />

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  background: #f3f4f6;
  font-family: 'Montserrat', sans-serif;
}

.main {
  flex: 1;
  min-width: 0;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  min-height: 0;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
}

.layout--mobile {
  overflow: visible;
}

@media (max-width: 960px) {
  .content {
    padding: 18px;
  }
}

@media (max-width: 700px) {
  .content {
    padding: 12px;
  }
}
</style>

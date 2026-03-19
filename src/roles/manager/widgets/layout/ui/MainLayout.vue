<script setup lang="ts">
import Sidebar from '@/roles/manager/widgets/siderbar/ui/Sidebar.vue'
import Header from '@/roles/student/widgets/header/ui/Header.vue';
</script>

<template>
  <div class="layout">
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
  height: 100vh;
  overflow: hidden;
  background: #f3f4f6;
  font: 'Montserrat';
}

.main {
  flex: 1;
  height: 100vh;
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
</style>

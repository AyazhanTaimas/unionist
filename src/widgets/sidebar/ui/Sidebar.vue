<script setup lang="ts">
import { studentMenu } from '../model/menu'
import SidebarItem from './SidebarItem.vue'
import HeaderLogo from '@/widgets/header/ui/HeaderLogo.vue'
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <HeaderLogo />
    </div>

    <div class="menu">
      <SidebarItem
        v-for="item in studentMenu"
        :key="item.route"
        :item="item"
      />
    </div>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  width: 280px;
  min-height: 100vh;

  padding: 16px 12px;
  background: transparent;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logo {
  padding: 8px 12px 16px;
  display: flex;
  align-items: flex-start;
}


.menu {
  margin-top: 70px;
  background: #f4fefe;
  border-radius: 40px;
  padding: 12px 8px;
}
</style>

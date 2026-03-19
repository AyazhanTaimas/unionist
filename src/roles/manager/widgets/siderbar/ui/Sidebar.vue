<script setup lang="ts">
import { managerMenu } from '../model/menu'
import SidebarItem from './SidebarItem.vue'
import HeaderLogo from '@/roles/student/widgets/header/ui/HeaderLogo.vue' // можно потом вынести в shared
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <HeaderLogo />
    </div>

    <div class="menu">
      <SidebarItem
        class="menu_items"
        v-for="item in managerMenu"
        :key="item.route"
        :item="item"
      />
    </div>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  width: 280px;
  height: 100vh;
  flex-shrink: 0;
  overflow: hidden;

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
  flex: 1;
  overflow: hidden;
  margin-top: 70px;
  background: #f4fefe;
  border-radius: 40px;
  padding: 12px 8px;
}

.menu_items {
  margin: 10px 0;
}
</style>
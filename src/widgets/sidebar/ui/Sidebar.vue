<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { studentMenu } from '../model/menu'
import SidebarItem from './SidebarItem.vue'
import HeaderLogo from '@/widgets/header/ui/HeaderLogo.vue'
import {
  getCachedDormAccessState,
  getDormAccessState,
  UNAPPROVED_STUDENT_ALLOWED_ROUTES,
} from '@/shared/lib/dormAccess'

const dormAccessState = ref(getCachedDormAccessState())

const visibleMenuItems = computed(() => {
  if (dormAccessState.value?.isStudent && !dormAccessState.value.isApproved) {
    return studentMenu.filter((item) =>
      UNAPPROVED_STUDENT_ALLOWED_ROUTES.includes(
        item.route as (typeof UNAPPROVED_STUDENT_ALLOWED_ROUTES)[number]
      )
    )
  }

  return studentMenu
})

onMounted(async () => {
  dormAccessState.value = await getDormAccessState()
})
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <HeaderLogo />
    </div>

    <div class="menu">
      <SidebarItem
        class="menu_items"
        v-for="item in visibleMenuItems"
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

.menu_items{
  margin: 10px 0;
}
</style>

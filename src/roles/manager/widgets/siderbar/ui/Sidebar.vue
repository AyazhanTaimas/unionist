<script setup lang="ts">
import { managerMenu } from '../model/menu'
import SidebarItem from './SidebarItem.vue'
import HeaderLogo from '@/roles/student/widgets/header/ui/HeaderLogo.vue' // можно потом вынести в shared
import { useAppShell } from '@/app/providers/layout/useAppShell'

const { isMobileViewport, isSidebarOpen, closeSidebar } = useAppShell()
</script>

<template>
  <div class="sidebar-shell" :class="{ 'sidebar-shell--open': isSidebarOpen }">
    <button
      v-if="isMobileViewport"
      class="sidebar-overlay"
      :class="{ 'sidebar-overlay--visible': isSidebarOpen }"
      type="button"
      aria-label="Закрыть меню"
      @click="closeSidebar"
    />

    <aside class="sidebar" :class="{ 'sidebar--open': isSidebarOpen }">
      <div class="sidebar-top">
        <div class="logo">
          <HeaderLogo />
        </div>

        <button
          v-if="isMobileViewport"
          class="sidebar-close"
          type="button"
          aria-label="Закрыть меню"
          @click="closeSidebar"
        >
          x
        </button>
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
  </div>
</template>

<style scoped lang="scss">
.sidebar-shell {
  position: relative;
  width: 280px;
  flex-shrink: 0;
}

.sidebar {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  padding: 16px 12px;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.logo {
  padding: 8px 12px 16px;
  display: flex;
  align-items: flex-start;
}

.menu {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-top: 70px;
  background: #f4fefe;
  border-radius: 40px;
  padding: 12px 8px;
}

.menu_items {
  margin: 10px 0;
}

.sidebar-close,
.sidebar-overlay {
  display: none;
}

@media (max-width: 960px) {
  .sidebar-shell {
    width: 0;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    display: block;
    border: none;
    background: rgba(15, 23, 42, 0.38);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
    z-index: 39;
  }

  .sidebar-overlay--visible {
    opacity: 1;
    pointer-events: auto;
  }

  .sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(320px, calc(100vw - 24px));
    padding: 16px 12px 20px;
    background: #f3f4f6;
    box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
    transform: translateX(calc(-100% - 24px));
    transition: transform 0.25s ease;
    z-index: 40;
  }

  .sidebar--open {
    transform: translateX(0);
  }

  .logo {
    padding: 0;
  }

  .sidebar-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 12px;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
  }

  .menu {
    margin-top: 24px;
    border-radius: 28px;
  }
}
</style>

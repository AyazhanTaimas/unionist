<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { SidebarItem } from '../model/type'

const props = defineProps<{
  item: SidebarItem
}>()

const route = useRoute()
const router = useRouter()

const isActive = computed(() => route.path === props.item.route)

const go = () => {
  router.push(props.item.route)
}
</script>

<template>
  <div
    class="sidebar-item"
    :class="{ active: isActive }"
    @click="go"
  >
    <component
      v-if="item.icon"
      :is="item.icon"
      class="icon"
    />

    <span class="label">{{ item.label }}</span>

    <span class="indicator" />
  </div>
</template>

<style scoped lang="scss">
.sidebar-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  color: #6b7280;
  transition: background 0.2s, color 0.2s;

  .icon {
    width: 22px;
    height: 22px;
    color: inherit;
  }

  .label {
    font-family: 'Montserrat', sans-serif;
    font-size: 16px;
    font-weight: 500;
    line-height: 20px;
    color: inherit;
  }

  .indicator {
    position: absolute;
    right: -8px;
    top: 8px;
    bottom: 8px;
    width: 4px;
    border-radius: 4px;
    background: #4f46e5;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    background: #eef2ff;
    color: #4f46e5;

    .indicator {
      opacity: 1;
    }
  }

  &.active {
    background: #eef2ff;
    color: #4f46e5;

    .indicator {
      opacity: 1;
    }
  }
}
</style>

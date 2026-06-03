<script setup lang="ts">
    import { computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useAppShell } from '@/app/providers/layout/useAppShell'
    import type { SidebarItem } from '../model/type.ts'
    import { useI18n } from '@/app/i18n'

    const props= defineProps<{
        item: SidebarItem
    }>()

    const route = useRoute()
    const router = useRouter()
    const { closeSidebar } = useAppShell()
    const { t } = useI18n()

    const isActive = computed(() => route.path === props.item.route)
    const label = computed(() =>
        props.item.labelKey ? t(props.item.labelKey) : props.item.label || ''
    )

    const go = async () => {
        closeSidebar()

        if (route.path === props.item.route) {
            return
        }

        await router.push(props.item.route)
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

    <span class="label">{{ label }}</span>

    <!-- 🔥 линия -->
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

  color: #6b7280; // серый по умолчанию
  transition: background 0.2s, color 0.2s;

  .icon {
    width: 22px;
    height: 22px;
    color: inherit; // 🔥 ключевой момент
  }

  .label {
    font-family: 'Montserrat', sans-serif;
    font-size: 16px;
    font-weight: 500;
    line-height: 20px;
    color: inherit;
  }

  /* линия справа */
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

  /* HOVER */
  &:hover {
    background: #eef2ff;
    color: #4f46e5;

    .indicator {
      opacity: 1;
    }
  }

  /* ACTIVE */
  &.active {
    background: #eef2ff;
    color: #4f46e5;

    .indicator {
      opacity: 1;
    }
  }
}

</style>

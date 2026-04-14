import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const MOBILE_SIDEBAR_BREAKPOINT = 960

const viewportWidth = ref(
  typeof window === 'undefined' ? MOBILE_SIDEBAR_BREAKPOINT + 1 : window.innerWidth
)
const isSidebarOpen = ref(false)

let lifecycleUsers = 0

const syncViewportWidth = () => {
  if (typeof window === 'undefined') {
    return
  }

  viewportWidth.value = window.innerWidth

  if (viewportWidth.value > MOBILE_SIDEBAR_BREAKPOINT) {
    isSidebarOpen.value = false
  }
}

const applyBodyScrollLock = () => {
  if (typeof document === 'undefined') {
    return
  }

  document.body.style.overflow =
    viewportWidth.value <= MOBILE_SIDEBAR_BREAKPOINT && isSidebarOpen.value ? 'hidden' : ''
}

export function useAppShell() {
  const isMobileViewport = computed(() => viewportWidth.value <= MOBILE_SIDEBAR_BREAKPOINT)

  const openSidebar = () => {
    if (isMobileViewport.value) {
      isSidebarOpen.value = true
    }
  }

  const closeSidebar = () => {
    isSidebarOpen.value = false
  }

  const toggleSidebar = () => {
    if (!isMobileViewport.value) {
      return
    }

    isSidebarOpen.value = !isSidebarOpen.value
  }

  return {
    mobileBreakpoint: MOBILE_SIDEBAR_BREAKPOINT,
    isMobileViewport,
    isSidebarOpen,
    openSidebar,
    closeSidebar,
    toggleSidebar,
  }
}

export function useAppShellLifecycle() {
  let stopWatch: (() => void) | null = null

  onMounted(() => {
    lifecycleUsers += 1

    if (lifecycleUsers === 1 && typeof window !== 'undefined') {
      syncViewportWidth()
      window.addEventListener('resize', syncViewportWidth)
    }

    stopWatch = watch([viewportWidth, isSidebarOpen], applyBodyScrollLock, {
      immediate: true,
    })
  })

  onUnmounted(() => {
    stopWatch?.()
    lifecycleUsers = Math.max(0, lifecycleUsers - 1)

    if (lifecycleUsers === 0 && typeof window !== 'undefined') {
      window.removeEventListener('resize', syncViewportWidth)
    }

    if (typeof document !== 'undefined') {
      if (lifecycleUsers === 0) {
        document.body.style.overflow = ''
      } else {
        applyBodyScrollLock()
      }
    }
  })
}

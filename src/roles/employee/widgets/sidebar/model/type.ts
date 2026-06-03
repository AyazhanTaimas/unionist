import type { Component } from 'vue'

export interface SidebarItem {
  label?: string
  labelKey?: string
  route: string
  icon: Component
}

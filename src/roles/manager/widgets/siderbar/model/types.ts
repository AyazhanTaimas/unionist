import type { Component } from "vue"

export interface SidebarItem {
  label: string
  route: string
  icon: Component
}
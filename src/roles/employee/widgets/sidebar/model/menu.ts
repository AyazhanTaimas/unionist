import type { SidebarItem } from './type'

import HomeIcon from '@/roles/student/shared/layout/ui/icons/HomeIcon.vue'
import RequestIcon from '@/roles/student/shared/layout/ui/icons/RequestIcon.vue'

export const employeeMenu: SidebarItem[] = [
  {
    label: 'Новости',
    route: '/employee/news',
    icon: HomeIcon,
  },
  {
    label: 'Ремонт',
    route: '/employee/repairs',
    icon: RequestIcon,
  },
]

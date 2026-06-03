import type { SidebarItem } from './type'

import HomeIcon from '@/roles/student/shared/layout/ui/icons/HomeIcon.vue'
import RequestIcon from '@/roles/student/shared/layout/ui/icons/RequestIcon.vue'

export const employeeMenu: SidebarItem[] = [
  {
    labelKey: 'nav.news',
    route: '/employee/news',
    icon: HomeIcon,
  },
  {
    labelKey: 'nav.repairs',
    route: '/employee/repairs',
    icon: RequestIcon,
  },
]

import type { SidebarItem } from './type'

import HomeIcon from '@/roles/student/shared/layout/ui/icons/HomeIcon.vue'
import PenaltyIcon from '@/roles/student/shared/layout/ui/icons/PenaltyIcon.vue'
import RequestIcon from '@/roles/student/shared/layout/ui/icons/RequestIcon.vue'

export const employeeMenu: SidebarItem[] = [
  {
    label: 'Новости',
    route: '/employee/news',
    icon: HomeIcon,
  },
  {
    label: 'Штрафы',
    route: '/employee/penalties',
    icon: PenaltyIcon,
  },
  {
    label: 'Ремонт',
    route: '/employee/repairs',
    icon: RequestIcon,
  },
]

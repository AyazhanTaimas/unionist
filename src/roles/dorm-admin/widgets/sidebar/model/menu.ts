import type { SidebarItem } from './type'

import HomeIcon from '@/roles/student/shared/layout/ui/icons/HomeIcon.vue'
import PenaltyIcon from '@/roles/student/shared/layout/ui/icons/PenaltyIcon.vue'
import UserIcon from '@/roles/student/widgets/header/ui/UserIcon.vue'

export const dormAdminMenu: SidebarItem[] = [
  {
    labelKey: 'nav.news',
    route: '/dorm-admin/news',
    icon: HomeIcon,
  },
  {
    labelKey: 'nav.penalty',
    route: '/dorm-admin/penalties',
    icon: PenaltyIcon,
  },
  {
    labelKey: 'nav.students',
    route: '/dorm-admin/students',
    icon: UserIcon,
  },
]

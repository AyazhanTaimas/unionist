import type { SidebarItem } from "./type"

import HomeIcon from "@/roles/student/shared/layout/ui/icons/HomeIcon.vue"
import PenaltyIcon from "@/roles/student/shared/layout/ui/icons/PenaltyIcon.vue"
import RequestIcon from "@/roles/student/shared/layout/ui/icons/RequestIcon.vue"

export const dormAdminMenu: SidebarItem[] = [
  {
    label: 'Новости',
    route: '/dorm-admin/news',
    icon: HomeIcon,
  },
  {
    label: 'Штрафы',
    route: '/dorm-admin/penalties',
    icon: PenaltyIcon,
  },
  {
    label: 'Ремонт',
    route: '/dorm-admin/repairs',
    icon: RequestIcon,
  },
]

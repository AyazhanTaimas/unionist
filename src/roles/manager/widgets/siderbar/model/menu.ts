import type { SidebarItem } from "./types"

// можешь переиспользовать иконки или потом заменить
import HomeIcon from "@/roles/student/shared/layout/ui/icons/HomeIcon.vue"
import RequestIcon from "@/roles/student/shared/layout/ui/icons/RequestIcon.vue"
import PenaltyIcon from "@/roles/student/shared/layout/ui/icons/PenaltyIcon.vue"
import BellIcon from "@/roles/student/widgets/header/ui/BellIcon.vue"

export const managerMenu: SidebarItem[] = [
  { labelKey: 'nav.news', route: '/manager/news', icon: HomeIcon },
  { labelKey: 'nav.notifications', route: '/manager/notifications', icon: BellIcon },
  { labelKey: 'nav.users', route: '/manager/users', icon: PenaltyIcon },
  { labelKey: 'nav.liveRequests', route: '/manager/requests', icon: RequestIcon },
  { labelKey: 'nav.changeRoom', route: '/manager/requests/change-room', icon: RequestIcon },
]

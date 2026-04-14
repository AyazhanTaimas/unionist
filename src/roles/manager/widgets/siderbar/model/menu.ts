import type { SidebarItem } from "./types"

// можешь переиспользовать иконки или потом заменить
import HomeIcon from "@/roles/student/shared/layout/ui/icons/HomeIcon.vue"
import RequestIcon from "@/roles/student/shared/layout/ui/icons/RequestIcon.vue"
import PenaltyIcon from "@/roles/student/shared/layout/ui/icons/PenaltyIcon.vue"
import BellIcon from "@/roles/student/widgets/header/ui/BellIcon.vue"

export const managerMenu: SidebarItem[] = [
  { label: 'Новости', route: '/manager/news', icon: HomeIcon },
  { label: 'Уведомления', route: '/manager/notifications', icon: BellIcon },
  { label: 'Пользователи', route: '/manager/users', icon: PenaltyIcon },
  { label: 'Заявки на проживание', route: '/manager/requests', icon: RequestIcon },
  { label: 'Смена комнаты', route: '/manager/requests/change-room', icon: RequestIcon },
]

import type { SidebarItem } from "./types"

// можешь переиспользовать иконки или потом заменить
import HomeIcon from "@/roles/student/shared/layout/ui/icons/HomeIcon.vue"
import RequestIcon from "@/roles/student/shared/layout/ui/icons/RequestIcon.vue"
import FinanceIcon from "@/roles/student/shared/layout/ui/icons/FinanceIcon.vue"
import PenaltyIcon from "@/roles/student/shared/layout/ui/icons/PenaltyIcon.vue"

export const managerMenu: SidebarItem[] = [
  { label: 'Новости', route: '/manager/news', icon: HomeIcon },
  { label: 'Создать новость', route: '/manager/news/create', icon: FinanceIcon },
  { label: 'Пользователи', route: '/manager/users', icon: PenaltyIcon },
  { label: 'Заявки на проживание', route: '/manager/requests', icon: RequestIcon },
]
import HousingIcon from "@/roles/student/shared/layout/ui/icons/HousingIcon.vue";
import type { SidebarItem } from "./types";
import HomeIcon from "@/roles/student/shared/layout/ui/icons/HomeIcon.vue";
import RequestIcon from "@/roles/student/shared/layout/ui/icons/RequestIcon.vue";
import FinanceIcon from "@/roles/student/shared/layout/ui/icons/FinanceIcon.vue";
import PenaltyIcon from "@/roles/student/shared/layout/ui/icons/PenaltyIcon.vue";
import GymIcon from "@/roles/student/shared/layout/ui/icons/GymIcon.vue";
import BuySellIcon from "@/roles/student/shared/layout/ui/icons/BuySellIcon.vue";

export const studentMenu: SidebarItem[] = [
    {label: 'Главная', route: '/news', icon: HomeIcon},
    {label: 'Проживание', route: '/housing', icon: HousingIcon},
    {label: 'Мои запросы', route: '/myrequest', icon: RequestIcon},
    {label: 'Ремонт', route: '/repairs', icon: PenaltyIcon},
    {label: 'Финансовый кабинет', route: '/finance', icon: FinanceIcon},
    {label: 'Штрафы', route: '/penalty', icon: PenaltyIcon},
    {label: 'Запись в тренажерный зал', route: '/gym', icon:GymIcon},
    {label: 'Купи-продай', route: '/buysell', icon: BuySellIcon}
]

import HousingIcon from "@/shared/layout/ui/icons/HousingIcon.vue";
import type { SidebarItem } from "./types";
import HomeIcon from "@/shared/layout/ui/icons/HomeIcon.vue";
import RequestIcon from "@/shared/layout/ui/icons/RequestIcon.vue";
import FinanceIcon from "@/shared/layout/ui/icons/FinanceIcon.vue";
import PenaltyIcon from "@/shared/layout/ui/icons/PenaltyIcon.vue";
import GymIcon from "@/shared/layout/ui/icons/GymIcon.vue";
import BuySellIcon from "@/shared/layout/ui/icons/BuySellIcon.vue";

export const studentMenu: SidebarItem[] = [
    {label: 'Главная', route: '/news', icon: HomeIcon},
    {label: 'Проживание', route: '/housing', icon: HousingIcon},
    {label: 'Мои запросы', route: '/myrequest', icon: RequestIcon},
    {label: 'Финансовый кабинет', route: '/finance', icon: FinanceIcon},
    {label: 'Штрафы', route: '/penalty', icon: PenaltyIcon},
    {label: 'Запись в тренажерный зал', route: '/gym', icon:GymIcon},
    {label: 'Купи-продай', route: '/buysell', icon: BuySellIcon}
]
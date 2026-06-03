import HousingIcon from "@/roles/student/shared/layout/ui/icons/HousingIcon.vue";
import type { SidebarItem } from "./types";
import HomeIcon from "@/roles/student/shared/layout/ui/icons/HomeIcon.vue";
import RequestIcon from "@/roles/student/shared/layout/ui/icons/RequestIcon.vue";
import FinanceIcon from "@/roles/student/shared/layout/ui/icons/FinanceIcon.vue";
import PenaltyIcon from "@/roles/student/shared/layout/ui/icons/PenaltyIcon.vue";
import GymIcon from "@/roles/student/shared/layout/ui/icons/GymIcon.vue";
import BuySellIcon from "@/roles/student/shared/layout/ui/icons/BuySellIcon.vue";

export const studentMenu: SidebarItem[] = [
    {labelKey: 'nav.home', route: '/news', icon: HomeIcon},
    {labelKey: 'nav.housing', route: '/housing', icon: HousingIcon},
    {labelKey: 'nav.myRequests', route: '/myrequest', icon: RequestIcon},
    {labelKey: 'nav.repairs', route: '/repairs', icon: PenaltyIcon},
    {labelKey: 'nav.finance', route: '/finance', icon: FinanceIcon},
    {labelKey: 'nav.penalty', route: '/penalty', icon: PenaltyIcon},
    {labelKey: 'nav.gym', route: '/gym', icon:GymIcon},
    {labelKey: 'nav.buySell', route: '/buysell', icon: BuySellIcon}
]

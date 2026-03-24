import { createRouter, createWebHistory } from 'vue-router'
import StudentLayout from '@/roles/student/widgets/layout/ui/MainLayout.vue'
import ManagerLayout from '@/roles/manager/widgets/layout/ui/MainLayout.vue'
import LoginPage from '@/pages/login/LoginPage.vue'
import DormAdminLayout from '@/roles/dorm-admin/widgets/layout/ui/MainLayout.vue'
import EmployeeLayout from '@/roles/employee/widgets/layout/ui/MainLayout.vue'

type AppRole = 'student' | 'manager' | 'admin' | 'dorm-admin' | 'employee' | null

function normalizeRole(role: string | null): AppRole {
  if (
    role === 'student' ||
    role === 'manager' ||
    role === 'admin' ||
    role === 'dorm-admin' ||
    role === 'employee'
  ) {
    return role
  }

  return null
}

function getDefaultRouteForRole(role: AppRole): string {
  if (role === 'manager' || role === 'admin') return '/manager'
  if (role === 'dorm-admin') return '/dorm-admin/news'
  if (role === 'employee') return '/employee/news'
  return '/news'
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },

    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/payment-success',
      name: 'payment-success',
      component: () => import('@/roles/student/pages/finance/PaymentSuccess.vue'),
    },
    {
      path: '/gym/payment-success',
      name: 'gym-payment-success',
      component: () => import('@/roles/student/pages/gym/GymPaymentSuccess.vue'),
    },
    {
      path: '/payment-cancel',
      name: 'payment-cancel',
      component: () => import('@/roles/student/pages/finance/PaymentCancel.vue'),
    },
    {
      path: '/',
      component: StudentLayout,
      children: [
        {
          path: 'news',
          name: 'student-news',
          component: () => import('@/roles/student/pages/news/ui/NewsPage.vue'),
        },
        {
          path: 'profile',
          name:'profile',
          component: () =>
            import('@/roles/student/pages/profile/ui/ProfilePage.vue'),
        },
        {
          path: 'housing',
          component: () =>
            import('@/roles/student/pages/housing/index.vue')
        },
        {
          path: 'myrequest',
          name: 'myrequest',
          component: () => import('@/roles/student/pages/myrequest/index.vue'),
        },
        {
          path: 'repairs',
          name: 'repairs',
          component: () => import('@/roles/student/pages/repairs/RepairsPage.vue'),
        },
        {
          path: 'finance',
          name: 'finance',
          component: () => import('@/roles/student/pages/finance/FinancePage.vue'),
        },
        {
          path: 'gym',
          name: 'gym',
          component: () => import('@/roles/student/pages/gym/index.vue'),
        },
        {
          path: 'penalty',
          name: 'penalty',
          component: () => import('@/roles/student/pages/penalty/index.vue'),
        },
        {
          path: 'buysell',
          name: 'buysell',
          component: () => import('@/roles/student/pages/buysell/index.vue'),
        },
        {
          path: 'buysell/my',
          name: 'buysell-my',
          component: () => import('@/roles/student/pages/buysell/ManagePage.vue'),
        },
        {
          path: 'buysell/:id',
          name: 'buysell-detail',
          component: () => import('@/roles/student/pages/buysell/DetailPage.vue'),
        },
      ],
    },
    {
      path: '/manager',
      component: ManagerLayout,
      children: [
        {
          path: '',
          name: 'manager-home',
          component: () => import('@/roles/manager/pages/HomePage.vue'),
        },
        {
          path: 'news',
          name: 'manager-news',
          component: () => import('@/roles/manager/pages/news/NewsPage.vue'),
        },
        {
          path: 'news/create',
          name: 'manager-news-create',
          component: () => import('@/roles/manager/pages/news/NewsPage.vue'),
        },
        {
          path: 'users',
          name: 'manager-users',
          component: () => import('@/roles/manager/pages/users/UsersPage.vue'),
        },
        {
          path: 'requests',
          name: 'manager-requests',
          component: () => import('@/roles/manager/pages/requests/RequestsPage.vue'),
        },
        {
          path: 'requests/change-room',
          name: 'manager-change-room-requests',
          component: () => import('@/roles/manager/pages/requests/ChangeRoomRequestsPage.vue'),
        },
      ],
    },

    {
      path: '/employee',
      component: EmployeeLayout,
      children: [
        {
          path: '',
          redirect: '/employee/news',
        },
        {
          path: 'news',
          name: 'employee-news',
          component: () => import('@/roles/employee/pages/news/NewsPage.vue'),
        },
        {
          path: 'penalties',
          redirect: '/employee/news',
        },
        {
          path: 'repairs',
          name: 'employee-repairs',
          component: () => import('@/roles/employee/pages/repairs/RepairsPage.vue'),
        },
      ],
    },
    {
      path: '/dorm-admin',
      component: DormAdminLayout,
      children: [
        {
          path: '',
          redirect: '/dorm-admin/news',
        },
        {
          path: 'news',
          name: 'dorm-admin-news',
          component: () => import('@/roles/dorm-admin/pages/news/NewsPage.vue'),
        },
        {
          path: 'penalties',
          name: 'dorm-admin-penalties',
          component: () => import('@/roles/dorm-admin/pages/penalty/Penalty.vue'),
        },
        {
          path: 'repairs',
          redirect: '/dorm-admin/news',
        },
      ],
    },

  ],
})

router.beforeEach(async (to) => {
  const token = localStorage.getItem('token')
  const role = normalizeRole(localStorage.getItem('role'))

  if (to.path === '/login') {
    if (!token) return true
    return { path: getDefaultRouteForRole(role) }
  }

  if (!token) {
    return { path: '/login' }
  }

  if (to.path.startsWith('/manager')) {
    if (role !== 'manager' && role !== 'admin') {
      return { path: getDefaultRouteForRole(role) }
    }

    return true
  }

  if (to.path.startsWith('/employee')) {
    if (role !== 'employee' && role !== 'admin') {
      return { path: getDefaultRouteForRole(role) }
    }

    return true
  }

  if (to.path.startsWith('/dorm-admin')) {
    if (role !== 'dorm-admin' && role !== 'admin') {
      return { path: getDefaultRouteForRole(role) }
    }

    return true
  }

  if (role === 'manager' || role === 'admin' || role === 'dorm-admin' || role === 'employee') {
    return { path: getDefaultRouteForRole(role) }
  }

  return true
})

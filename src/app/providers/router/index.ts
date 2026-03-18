import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/widgets/layout/ui/MainLayout.vue'
import LoginPage from '@/pages/login/LoginPage.vue';
import {
  canUnapprovedStudentAccessPath,
  getDormAccessState,
} from '@/shared/lib/dormAccess'

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
      component: () => import('@/pages/finance/PaymentSuccess.vue'),
    },
    {
      path: '/gym/payment-success',
      name: 'gym-payment-success',
      component: () => import('@/pages/gym/GymPaymentSuccess.vue'),
    },
    {
      path: '/payment-cancel',
      name: 'payment-cancel',
      component: () => import('@/pages/finance/PaymentCancel.vue'),
    },

    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: 'news',
          name: 'news',
          component: () => import('@/pages/news/ui/NewsPage.vue'),
        },
        {
          path: 'profile',
          name:'profile',
          component: () =>
            import('@/pages/profile/ui/ProfilePage.vue'),
        },
        {
          path: 'housing',
          component: () =>
            import('@/pages/housing/index.vue')
        },
        {
          path: 'myrequest',
          name: 'myrequest',
          component: () => import('@/pages/myrequest/index.vue'),
        },
        {
          path: 'finance',
          name: 'finance',
          component: () => import('@/pages/finance/FinancePage.vue'),
        },
        {
          path: 'gym',
          name: 'gym',
          component: () => import('@/pages/gym/index.vue'),
        },
        {
          path: 'penalty',
          name: 'penalty',
          component: () => import('@/pages/penalty/index.vue'),
        },
      ],
    },


  ],
})

router.beforeEach(async (to) => {
  if (!localStorage.getItem('token')) {
    return true
  }

  const dormAccessState = await getDormAccessState()

  if (!dormAccessState.isStudent || dormAccessState.isApproved) {
    return true
  }

  if (canUnapprovedStudentAccessPath(to.path)) {
    return true
  }

  return { path: '/news' }
})

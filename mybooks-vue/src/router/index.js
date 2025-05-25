import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/read',
      name: 'read',
      component: () => import('@/views/ReadView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/recommended',
      name: 'recommended',
      component: () => import('@/views/RecommendedView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/want_to_read',
      name: 'want_to_read',
      component: () => import('@/views/WantToReadView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/guest',
      name: 'guest',
      component: () => import('@/views/GuestView.vue')
    }
  ]
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.user) {
    next('/')
  } else {
    next()
  }
})

export default router

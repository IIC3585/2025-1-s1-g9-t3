
import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Recommended from '@/views/Recommended.vue'
import Read from '@/views/Read.vue'
import ToRead from '@/views/ToRead.vue'
import Search from '@/views/Search.vue'
import Book from '@/views/Book.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home },
  { path: '/recommended', component: Recommended },
  { path: '/read', component: Read },
  { path: '/toRead', component: ToRead },
  { path: '/search', component: Search },
  { path: '/book', component: Book }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

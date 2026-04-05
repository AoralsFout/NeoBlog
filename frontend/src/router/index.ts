import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '首页',
      component: () => import('@/views/Home.vue'),
    },
    // 404
    {
      path: '/:catchAll(.*)',
      name: '404',
      component: () => import('@/views/404.vue'),
    }
  ],
})

export default router

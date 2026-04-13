import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '首页',
      component: () => import('@/views/Home.vue'),
      redirect: '/articles',
      children: [
        {
          path: '/articles',
          name: '文章',
          component: () => import('@/views/Articles.vue'),
        },
        {
          path: '/settings',
          name: '设置',
          component: () => import('@/views/Settings.vue'),
        },
      ],
    },
    {
      path: '/:catchAll(.*)',
      name: '404',
      component: () => import('@/views/404.vue'),
    }
  ],
})

export default router

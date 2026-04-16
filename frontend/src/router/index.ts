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
        {
          path: '/user',
          name: '个人中心',
          component: () => import('@/views/User.vue'),
        },
        {
          path: '/login',
          name: '登录',
          component: () => import('@/views/Login.vue'),
        },
        {
          path: '/auth/callback',
          name: 'OAuth回调',
          component: () => import('@/views/OAuthCallback.vue'),
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

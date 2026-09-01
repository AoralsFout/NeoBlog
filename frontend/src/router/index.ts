import { createRouter, createWebHistory } from 'vue-router'
// 新增: 导入 useUserStore
import { useUserStore } from '@/stores/user'

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
          path: '/article/new',
          name: '写文章',
          component: () => import('@/views/ArticleEditor.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: '/article/:id/edit',
          name: '编辑文章',
          component: () => import('@/views/ArticleEditor.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: '/article/:id',
          name: '文章详情',
          component: () => import('@/views/ArticleDetail.vue'),
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

// 全局前置守卫
router.beforeEach(async (to) => {
  const userStore = useUserStore()

  if (to.meta.requiresAdmin) {
    // 页面刷新时用户状态尚未加载：先等待初始化完成再判断
    if (!userStore.isAuthenticated) {
      await userStore.initUser()
    }
    if (!userStore.isAuthenticated || !userStore.isAdmin) {
      return '/'
    }
  }
})

export default router

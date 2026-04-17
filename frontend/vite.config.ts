import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// 获取GIT信息，用于页脚显示git信息
let gitHash = ''
let gitDate = ''

try {
  gitHash = execSync('git rev-parse --short HEAD').toString().trim()
  gitDate = new Date(execSync('git log -1 --format=%cd').toString().trim()).toISOString()
} catch (e) {
  console.error('Failed to get git info:', e)
  gitHash = 'N/A'
  gitDate = new Date().toISOString()
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  // 获取后端 API 基础地址，如果未配置则使用默认值
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:3001'

  return {
    define: {
      __GIT_HASH__: JSON.stringify(gitHash),
      __GIT_DATE__: JSON.stringify(gitDate),
    },
    plugins: [
      vue()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      port: 3000,
      // 将 /api 请求代理到后端
      // 将 /images 请求代理到静态资源 /images目录
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        },
        '/images': {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/images/, '/images')
        },
        '/uploads': {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/uploads/, '/uploads')
        }
      }
    }
  }
})
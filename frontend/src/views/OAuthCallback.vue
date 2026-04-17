<template>
  <div class="oauth-callback-container">
    <div class="callback-card">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <h2>正在处理登录...</h2>
        <p>请稍候，正在验证您的身份</p>
      </div>

      <div v-else-if="isSuccess" class="success">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <h2>登录成功！</h2>
        <p>正在为您跳转...</p>
      </div>

      <div v-else class="error">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
          </svg>
        </div>
        <h2>登录失败</h2>
        <p>{{ errorMessage }}</p>
        <div class="action-buttons">
          <router-link to="/login" class="btn btn-primary">
            返回登录页面
          </router-link>
          <router-link to="/" class="btn btn-secondary">
            返回首页
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isLoading = ref(true);
const isSuccess = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  try {
    // 从URL参数获取token和user_id
    const token = route.query.token as string;
    const userId = route.query.user_id as string;

    if (!token || !userId) {
      throw new Error('缺少必要的认证参数');
    }

    // 处理OAuth回调
    const success = await userStore.handleOAuthCallback(token, userId);

    if (success) {
      isSuccess.value = true;
      // 2秒后跳转到主页面
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      throw new Error('OAuth回调处理失败');
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '未知错误';
    console.error('OAuth回调处理失败:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.oauth-callback-container {
  display: flex;
  justify-content: center;
}

.callback-card {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-large);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  padding: 3rem;
  text-align: center;
}

.loading,
.success,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--border-color);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-icon,
.error-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.success-icon svg {
  width: 40px;
  height: 40px;
}

.error-icon {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.error-icon svg {
  width: 40px;
  height: 40px;
}

h2 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--text-primary);
}

p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-medium);
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary);
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--bg-secondary);
  transform: translateY(-2px);
}
</style>
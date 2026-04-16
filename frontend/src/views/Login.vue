<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>登录到 NeoBlog</h1>
      </div>

      <div class="login-content">
        <div v-if="isAuthenticated" class="already-logged-in">
          <div class="user-info">
            <img v-if="userStore.currentUser?.avatar" :src="userStore.currentUser.avatar" alt="用户头像"
              class="user-avatar" />
            <div v-else class="avatar-placeholder">
              {{ userStore.currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div class="user-details">
              <h3>{{ userStore.currentUser?.username }}</h3>
              <p>{{ userStore.currentUser?.email }}</p>
            </div>
          </div>
          <p class="login-message">您已经登录了！</p>
          <div class="action-buttons">
            <router-link to="/user" class="btn btn-primary">
              前往个人中心
            </router-link>
            <button @click="handleLogout" class="btn btn-secondary" :disabled="userStore.isLoading">
              {{ userStore.isLoading ? '登出中...' : '退出登录' }}
            </button>
          </div>
        </div>

        <div v-else class="login-options">
          <div class="login-method">
            <div class="method-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div class="method-info">
              <h3>Natayark</h3>
              <p>使用 Natayark 账户进行安全登录</p>
            </div>
            <Button @click="handleLogin" size="lg" :disabled="userStore.isLoading">{{ userStore.isLoading ? '跳转中...' :
              '立即登录' }}</Button>
          </div>

          <div class="login-tips">
            <p><strong>提示：</strong>登录后您可以：</p>
            <ul>
              <li>查看和管理您的个人资料</li>
              <li>评论文章和参与讨论</li>
            </ul>
          </div>
        </div>

        <div v-if="userStore.error" class="error-message">
          {{ userStore.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import Button from '@/components/Button.vue';

const userStore = useUserStore();
const router = useRouter();

const isAuthenticated = computed(() => userStore.isAuthenticated);

const handleLogin = () => {
  userStore.login();
};

const handleLogout = async () => {
  await userStore.logout();
  router.push('/');
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-large);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  overflow: hidden;
}

.login-header {
  padding: 2rem;
  text-align: center;
  background-color: var(--color-primary);
  color: white;
}

.login-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.login-content {
  padding: 2rem;
}

.already-logged-in {
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.user-details h3 {
  margin: 0;
  font-size: 1.2rem;
}

.user-details p {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.login-message {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.login-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login-method {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-medium);
  border: 1px solid var(--border-color);
}

.method-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.method-icon svg {
  width: 24px;
  height: 24px;
}

.method-info {
  flex: 1;
}

.method-info h3 {
  margin: 0;
  font-size: 1.1rem;
}

.method-info p {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.login-tips {
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-medium);
  border: 1px solid var(--border-color);
}

.login-tips p {
  margin: 0 0 0.75rem;
  font-weight: 500;
}

.login-tips ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-secondary);
}

.login-tips li {
  margin-bottom: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border-radius: var(--radius-medium);
  border: 1px solid rgba(220, 53, 69, 0.2);
  font-size: 0.9rem;
}
</style>
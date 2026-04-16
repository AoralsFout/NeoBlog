<template>
  <div class="user-profile-container">
    <div class="profile-header">
      <h1>个人中心</h1>
      <p>管理您的账户和个人信息</p>
    </div>

    <div v-if="userStore.isLoading && !userStore.currentUser" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="!userStore.isAuthenticated" class="not-authenticated">
      <div class="auth-prompt">
        <h2>您还未登录</h2>
        <p>请登录以查看和管理您的个人资料</p>
        <router-link to="/login" class="btn btn-primary">
          前往登录
        </router-link>
      </div>
    </div>

    <div v-else class="profile-content">
      <div class="profile-layout">
        <div class="profile-sidebar">
          <div class="user-card">
            <div class="user-avatar-section">
              <img v-if="userStore.currentUser?.avatar" :src="userStore.currentUser.avatar" alt="用户头像"
                class="user-avatar" />
              <div v-else class="avatar-placeholder">
                {{ userStore.currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
              </div>
              <Button class="change-avatar-btn" @click="changeAvatar">
                更换头像
              </Button>
            </div>

            <div class="user-basic-info">
              <h2>{{ userStore.currentUser?.username }}</h2>
              <p class="user-email">{{ userStore.currentUser?.email }}</p>

              <div class="user-stats">
                <div class="stat-item">
                  <span class="stat-label">角色</span>
                  <span class="stat-value badge" :class="userStore.currentUser?.role">
                    {{ userStore.currentUser?.role === 'admin' ? '管理员' : '普通用户' }}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">状态</span>
                  <span class="stat-value badge" :class="userStore.currentUser?.status">
                    {{ getStatusText(userStore.currentUser?.status) }}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">注册时间</span>
                  <span class="stat-value">
                    {{ formatDate(userStore.currentUser?.created_at) }}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">最后更新</span>
                  <span class="stat-value">
                    {{ formatDate(userStore.currentUser?.updated_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-main">
          <div class="profile-section">
            <div class="section-header">
              <h3>个人信息</h3>
              <Button v-if="!isEditing" @click="startEditing">
                编辑信息
              </Button>
              <div v-else class="edit-actions">
                <Button @click="saveChanges" :disabled="isSaving">
                  {{ isSaving ? '保存中...' : '保存更改' }}
                </Button>
                <Button @click="cancelEditing">
                  取消
                </Button>
              </div>
            </div>

            <div v-if="!isEditing" class="info-display">
              <div class="info-row">
                <span class="info-label">用户名</span>
                <span class="info-value">{{ userStore.currentUser?.username }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">电子邮箱</span>
                <span class="info-value">{{ userStore.currentUser?.email }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">用户ID</span>
                <span class="info-value">{{ userStore.currentUser?.id }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Natayark ID</span>
                <span class="info-value">{{ userStore.currentUser?.natayark_id }}</span>
              </div>
            </div>

            <form v-else @submit.prevent="saveChanges" class="edit-form">
              <div class="form-group">
                <label for="username">用户名</label>
                <input id="username" v-model="editForm.username" type="text" required :disabled="isSaving" />
              </div>

              <div class="form-group">
                <label for="email">电子邮箱</label>
                <input id="email" v-model="editForm.email" type="email" required :disabled="isSaving" />
              </div>

              <div class="form-group">
                <label for="avatar">头像URL</label>
                <input id="avatar" v-model="editForm.avatar" type="url" placeholder="https://example.com/avatar.jpg"
                  :disabled="isSaving" />
                <p class="form-help">请输入头像图片的完整URL地址</p>
              </div>
            </form>
          </div>

          <div class="profile-section">
            <div class="section-header">
              <h3>账户安全</h3>
            </div>
            <div class="security-actions">
              <Button disabled>
                修改密码（OAuth账户不可用）
              </Button>
              <p class="security-note">
                由于您使用OAuth登录，密码修改功能不可用。如需更改账户信息，请访问 Natayark 平台。
              </p>
            </div>
          </div>

          <div v-if="userStore.error" class="error-message">
            {{ userStore.error }}
            <Button @click="userStore.clearError()" class="close-error">
              &times;
            </Button>
          </div>
        </div>

        <Button @click="handleLogout" type="danger" :disabled="userStore.isLoading">
          {{ userStore.isLoading ? '登出中...' : '退出登录' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import type { User } from '@/types/user';
import Button from '@/components/Button.vue';

const userStore = useUserStore();
const router = useRouter();

// 编辑状态
const isEditing = ref(false);
const isSaving = ref(false);

// 编辑表单数据
const editForm = reactive({
  username: '',
  email: '',
  avatar: '',
});

// 初始化用户数据
onMounted(() => {
  if (!userStore.currentUser) {
    userStore.fetchCurrentUser();
  }
});

// 开始编辑
const startEditing = () => {
  if (userStore.currentUser) {
    editForm.username = userStore.currentUser.username;
    editForm.email = userStore.currentUser.email;
    editForm.avatar = userStore.currentUser.avatar || '';
    isEditing.value = true;
  }
};

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false;
};

// 保存更改
const saveChanges = async () => {
  if (!userStore.currentUser) return;

  isSaving.value = true;
  try {
    await userStore.updateUserProfile(editForm);
    isEditing.value = false;
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    isSaving.value = false;
  }
};

// 更换头像
const changeAvatar = () => {
  // 这里可以添加上传头像的逻辑
  alert('头像上传功能暂未实现');
};

// 用户登出
const handleLogout = async () => {
  await userStore.logout();
  router.push('/');
};

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知';
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 获取状态文本
const getStatusText = (status?: string) => {
  switch (status) {
    case 'normal':
      return '正常';
    case 'banned':
      return '已封禁';
    case 'forzen':
      return '已冻结';
    default:
      return '未知';
  }
};
</script>

<style scoped>
.user-profile-container {
  background-color: var(--bg-primary);
  border-radius: var(--radius-small);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-header h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--text-primary);
}

.profile-header p {
  margin: 0.5rem 0 0;
  color: var(--text-secondary);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.not-authenticated {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.auth-prompt {
  text-align: center;
  padding: 3rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-large);
  border: 1px solid var(--border-color);
}

.auth-prompt h2 {
  margin: 0 0 1rem;
  color: var(--text-primary);
}

.auth-prompt p {
  margin: 0 0 1.5rem;
  color: var(--text-secondary);
}

.profile-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-card {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-large);
  padding: 2rem;
  border: 1px solid var(--border-color);
}

.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-color);
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  border: 3px solid var(--color-primary);
}

.user-basic-info {
  flex-grow: 1;
  text-align: center;
  margin-bottom: 1.5rem;
}

.user-basic-info h2 {
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}

.user-email {
  margin: 0 0 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.user-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.stat-value {
  color: var(--text-primary);
  font-weight: 500;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge.admin {
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.badge.member {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.badge.normal {
  background-color: rgba(40, 167, 69, 0.1);
  color: #28a745;
}

.badge.banned,
.badge.forzen {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-section {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-large);
  padding: 2rem;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.3rem;
}

.edit-actions {
  display: flex;
}

.info-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  color: var(--text-primary);
  font-weight: 600;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text-primary);
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-help {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.security-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-note {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-style: italic;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border-radius: var(--radius-medium);
  border: 1px solid rgba(220, 53, 69, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-error {
  background: none;
  border: none;
  color: #dc3545;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}
</style>
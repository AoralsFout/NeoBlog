import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@/types/user";
import { authApi, userApi, uploadApi, setToken, removeToken } from "@/utils/api";

export const useUserStore = defineStore("user", () => {
  // 当前用户信息
  const currentUser = ref<User | null>(null);

  // 加载状态
  const isLoading = ref(false);

  // 错误信息
  const error = ref<string | null>(null);

  // 计算属性：是否已登录
  const isAuthenticated = computed(() => {
    return currentUser.value !== null;
  });

  // 计算属性：是否是管理员
  const isAdmin = computed(() => {
    return currentUser.value?.role === "admin";
  });

  /**
   * 初始化用户状态（从本地存储恢复）
   */
  const initUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetchCurrentUser();
      } catch (err) {
        // 令牌无效，清除本地存储
        console.error("令牌无效:", err);
        localStorage.removeItem("token");
        currentUser.value = null;
      }
    }
  };

  /**
   * 获取当前用户信息
   */
  const fetchCurrentUser = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        currentUser.value = response.data;
      } else {
        throw new Error("获取用户信息失败");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取用户信息失败";
      currentUser.value = null;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 用户登录（通过OAuth重定向）
   */
  const login = () => {
    authApi.redirectToOAuth();
  };

  /**
   * 处理OAuth回调
   * @param token 认证令牌
   * @param userId 用户ID
   */
  const handleOAuthCallback = async (token: string, userId: string) => {
    try {
      // 存储令牌
      setToken(token);

      // 获取用户信息
      await fetchCurrentUser();

      return true;
    } catch (err) {
      console.error("OAuth回调处理失败:", err);
      removeToken();
      currentUser.value = null;
      return false;
    }
  };

  /**
   * 用户登出
   */
  const logout = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await authApi.logout();
    } catch (err) {
      console.error("登出请求失败:", err);
      // 即使API请求失败，也清除本地状态
    } finally {
      // 清除本地存储和状态
      removeToken();
      currentUser.value = null;
      isLoading.value = false;
    }
  };

  /**
   * 更新用户信息
   */
  const updateUserProfile = async (userData: Partial<User>) => {
    isLoading.value = true;
    error.value = null;

    try {
      if (!currentUser.value) {
        throw new Error("用户未登录");
      }

      // 调用更新用户API
      const response = await userApi.updateUser(currentUser.value.id, userData);

      if (response.success && response.data) {
        // 更新本地用户状态
        currentUser.value = response.data;
        return currentUser.value;
      } else {
        throw new Error("更新用户信息失败");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "更新用户信息失败";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 上传用户头像
   */
  const uploadAvatar = async (file: File) => {
    isLoading.value = true;
    error.value = null;

    try {
      if (!currentUser.value) {
        throw new Error("用户未登录");
      }

      // 创建FormData对象
      const formData = new FormData();
      formData.append('avatar', file);

      // 调用上传头像API
      const response = await uploadApi.uploadAvatar(formData);

      if (response.success && response.data?.user) {
        // 更新本地用户状态
        currentUser.value = response.data.user;
        return response.data;
      } else {
        throw new Error("头像上传失败");
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "头像上传失败";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 清除错误信息
   */
  const clearError = () => {
    error.value = null;
  };

  return {
    // 状态
    currentUser,
    isLoading,
    error,

    // 计算属性
    isAuthenticated,
    isAdmin,

    // 方法
    initUser,
    fetchCurrentUser,
    login,
    handleOAuthCallback,
    logout,
    updateUserProfile,
    uploadAvatar,
    clearError,
  };
});
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "@/types/user";
import { authApi, userApi, uploadApi } from "@/utils/api";

export const useUserStore = defineStore("user", () => {
  // 当前用户信息
  const currentUser = ref<User | null>(null);

  // 会话是否已完成首次初始化（无论成功或未登录）
  // 注意：不能用 currentUser 是否为 null 代替——未登录时它永远是 null，
  // 会导致每个调用方都重新发起一次 /api/auth/me 请求
  const bootstrapped = ref(false);

  // 会话初始化中的加载态（仅 bootstrapped 之前为 true）
  const isBootstrapping = ref(false);

  // 按操作区分的进行中状态
  // 历史上这里是单一的 isLoading，被 fetchCurrentUser/logout/updateUserProfile/uploadAvatar
  // 共用，导致用户上传头像时导航栏登出按钮显示"登出中..."
  const pending = ref({
    logout: false,
    updateProfile: false,
    uploadAvatar: false,
  });

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

  // 初始化去重：并发调用只发一次请求
  let initPromise: Promise<void> | null = null;

  /**
   * 初始化用户状态（通过HttpOnly Cookie向服务端获取）
   * 页面刷新后由路由守卫统一调用，重复调用会被去重
   */
  const initUser = (): Promise<void> => {
    if (bootstrapped.value) {
      return Promise.resolve();
    }
    if (!initPromise) {
      initPromise = (async () => {
        isBootstrapping.value = true;
        try {
          await fetchCurrentUser();
        } catch {
          // 未登录或令牌无效：静默保持未登录状态
          currentUser.value = null;
        } finally {
          isBootstrapping.value = false;
          bootstrapped.value = true;
          initPromise = null;
        }
      })();
    }
    return initPromise;
  };

  /**
   * 获取当前用户信息
   * @returns 是否成功取得用户（未登录时为 false）
   */
  const fetchCurrentUser = async (): Promise<boolean> => {
    error.value = null;
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        currentUser.value = response.data;
        return true;
      }
      currentUser.value = null;
      return false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "获取用户信息失败";
      currentUser.value = null;
      throw err;
    }
  };

  /**
   * 用户登录（通过OAuth重定向，令牌由后端写入HttpOnly Cookie）
   */
  const login = () => {
    authApi.redirectToOAuth();
  };

  /**
   * 处理OAuth回调（Cookie已由后端种下，直接拉取用户信息）
   */
  const handleOAuthCallback = async (): Promise<boolean> => {
    try {
      const ok = await fetchCurrentUser();
      return ok;
    } catch (err) {
      console.error("OAuth回调处理失败:", err);
      currentUser.value = null;
      return false;
    } finally {
      // 回调页已取得权威结果，标记会话已初始化，避免守卫重复请求
      bootstrapped.value = true;
    }
  };

  /**
   * 用户登出
   */
  const logout = async () => {
    pending.value.logout = true;
    error.value = null;

    try {
      // 后端清除HttpOnly Cookie并撤销令牌
      await authApi.logout();
    } catch (err) {
      console.error("登出请求失败:", err);
      // 即使API请求失败，也清除本地状态
    } finally {
      currentUser.value = null;
      pending.value.logout = false;
    }
  };

  /**
   * 更新用户信息
   */
  const updateUserProfile = async (userData: Partial<User>) => {
    pending.value.updateProfile = true;
    error.value = null;

    try {
      if (!currentUser.value) {
        throw new Error("用户未登录");
      }

      // 过滤空字符串字段（后端校验规则会拒绝空头像URL等）
      const payload: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(userData)) {
        if (value !== '' && value !== undefined && value !== null) {
          payload[key] = value;
        }
      }

      // 调用更新用户API
      const response = await userApi.updateUser(currentUser.value.id, payload);

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
      pending.value.updateProfile = false;
    }
  };

  /**
   * 上传用户头像
   */
  const uploadAvatar = async (file: File) => {
    pending.value.uploadAvatar = true;
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
      pending.value.uploadAvatar = false;
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
    bootstrapped,
    isBootstrapping,
    pending,
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

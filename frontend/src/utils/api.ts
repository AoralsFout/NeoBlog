/**
 * API工具函数
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * 获取认证令牌
 */
function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * 设置认证令牌
 */
export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

/**
 * 移除认证令牌
 */
export function removeToken(): void {
  localStorage.removeItem('token');
}

/**
 * 获取请求头
 */
function getHeaders(contentType: string = 'application/json'): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': contentType,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * 处理响应
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || `请求失败: ${response.status}`);
  }

  return response.json();
}

/**
 * GET请求
 */
export async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<T>(response);
}

/**
 * POST请求
 */
export async function post<T>(endpoint: string, data?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });

  return handleResponse<T>(response);
}

/**
 * PATCH请求
 */
export async function patch<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<T>(response);
}

/**
 * DELETE请求
 */
export async function del<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  return handleResponse<T>(response);
}

/**
 * 用户认证API
 */
export const authApi = {
  /**
   * 获取当前用户信息
   */
  getCurrentUser: () => get<{ success: boolean; data: any }>('/api/auth/me'),

  /**
   * 用户登出
   */
  logout: () => post<{ success: boolean; message: string }>('/api/auth/logout'),

  /**
   * 跳转到OAuth登录
   */
  redirectToOAuth: () => {
    window.location.href = `${API_BASE_URL}/api/auth/natayark`;
  },
};

/**
 * 用户API
 */
export const userApi = {
  /**
   * 获取所有用户
   */
  getUsers: () => get<{ success: boolean; data: any[] }>('/api/users'),

  /**
   * 根据ID获取用户
   */
  getUserById: (id: number) => get<{ success: boolean; data: any }>(`/api/users/${id}`),

  /**
   * 更新用户信息
   */
  updateUser: (id: number, data: any) => patch<{ success: boolean; data: any }>(`/api/users/${id}`, data),

  /**
   * 搜索用户
   */
  searchUsers: (query: string) => get<{ success: boolean; data: any[] }>(`/api/users/search?q=${encodeURIComponent(query)}`),
};
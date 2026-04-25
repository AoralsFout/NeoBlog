/**
 * API工具函数
 */

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
  const headers: HeadersInit = {};

  // 只有在contentType不为空时才添加Content-Type
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

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
  const response = await fetch(`${endpoint}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<T>(response);
}

/**
 * POST请求
 */
export async function post<T>(endpoint: string, data?: any): Promise<T> {
  const response = await fetch(`${endpoint}`, {
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
  const response = await fetch(`${endpoint}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<T>(response);
}

/**
 * DELETE请求
 */
export async function del<T>(endpoint: string, data?: any): Promise<T> {
  const options: RequestInit = {
    method: 'DELETE',
    headers: getHeaders(),
  };

  // 如果有数据，添加到请求体
  if (data) {
    options.headers = getHeaders('application/json');
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${endpoint}`, options);

  return handleResponse<T>(response);
}

/**
 * 文件上传请求
 */
export async function upload<T>(endpoint: string, formData: FormData): Promise<T> {
  // 对于文件上传，不设置Content-Type，让浏览器自动设置
  const response = await fetch(`${endpoint}`, {
    method: 'POST',
    headers: getHeaders(''), // 传递空字符串表示不设置Content-Type
    body: formData,
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
    window.location.href = `/api/auth/natayark`;
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

/**
 * 文件上传API
 */
/**
 * 评论API
 */
export const commentApi = {
  /**
   * 获取评论列表
   */
  getComments: (params: { source_id: string; source_type: string; page?: number; limit?: number; sort?: 'time' | 'hot' }) =>
    get<{ success: boolean; comments: any[]; pagination: any }>(`/api/comments?source_id=${encodeURIComponent(params.source_id)}&source_type=${encodeURIComponent(params.source_type)}&page=${params.page || 1}&limit=${params.limit || 10}&sort=${params.sort || 'time'}`),

  /**
   * 创建评论
   */
  createComment: (data: { content: string; source_id: string; source_type: string; parent_id?: number }) =>
    post<{ success: boolean; data: any }>('/api/comments', data),

  /**
   * 切换点赞/点踩
   */
  toggleReaction: (commentId: number, type: 'like' | 'dislike') =>
    post<{ success: boolean; data: any }>(`/api/comments/${commentId}/reaction`, { type }),
};

export const uploadApi = {
  /**
   * 上传文件
   */
  uploadFile: (formData: FormData) => upload<{ success: boolean; data: any }>('/api/upload', formData),

  /**
   * 上传头像
   */
  uploadAvatar: (formData: FormData) => upload<{ success: boolean; data: any }>('/api/upload/avatar', formData),

  /**
   * 删除上传的文件
   */
  deleteFile: (filepath: string) => del<{ success: boolean; message: string }>('/api/upload', { filepath }),
};
/**
 * 共享格式化工具
 *
 * 背景：日期格式化此前在 ArticleCard.vue 与 ArticleDetail.vue 各有一份逐字相同的实现，
 * CommentBox.vue、User.vue、Footer.vue 又各有自己的版本，共 5 处。
 * 标签解析在 ArticleCard.vue 与 ArticleDetail.vue 各写一遍。
 * 本文件是这些格式的唯一实现处。
 */

const pad2 = (value: number): string => String(value).padStart(2, '0');

/**
 * 标准短日期：YYYY-MM-DD
 * 用于文章卡片、文章详情等列表/正文场景（与改动前逐字一致）
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * 长日期：zh-CN 的 "2026年5月10日" 风格
 * 用于个人中心等展示场景；空值时返回"未知"（保持 User.vue 原行为）
 */
export function formatDateLong(value: string | Date | null | undefined): string {
  if (!value) return '未知';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '未知';
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 相对时间：刚刚 / N分钟前 / N小时前 / N天前，超过 30 天回退到 YYYY-MM-DD HH:mm
 * 用于评论区（与改动前的分支顺序和阈值一致）
 */
export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;

  return `${formatDate(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/**
 * 时长 mm:ss（音乐播放器进度显示）
 */
export function formatDuration(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  return `${pad2(Math.floor(safe / 60))}:${pad2(Math.floor(safe % 60))}`;
}

/**
 * 千分位数字（站点统计，RightSidebar 使用）
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('zh-CN');
}

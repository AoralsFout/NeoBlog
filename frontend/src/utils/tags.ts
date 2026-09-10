/**
 * 文章标签工具
 *
 * 背景：标签在库中以逗号分隔字符串存储（`tags String? @db.VarChar(500)`），
 * 解析逻辑此前在 ArticleCard.vue 与 ArticleDetail.vue 各写一遍且逐字相同。
 * 本文件是唯一的解析处。
 *
 * 注意：后端也有自己的标签处理（stats.service 的标签云按逗号切分、
 * article.service 用 LIKE 过滤）。若将来把标签改为关系表，应以此处为
 * 前端唯一改造点。
 */

/**
 * 把逗号分隔的标签串解析为去空白、去空项的数组
 * @example parseTags('a, b, ,c') => ['a', 'b', 'c']
 */
export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * 数组还原为逗号分隔串（提交表单时使用）
 */
export function joinTags(tags: readonly string[]): string {
  return tags.map((tag) => tag.trim()).filter(Boolean).join(',');
}

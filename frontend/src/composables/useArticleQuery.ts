import { ref, computed, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { articleApi } from '@/utils/api';
import type { Article, Pagination } from '@/types/article';

/**
 * 文章列表查询协调器
 *
 * 背景：文章列表语义此前在 Articles.vue 各自实现了一套状态机
 * （articles / pagination / loading / error / sort / page / tag + loadArticles + applyQuery），
 * 并且 onMounted(applyQuery) 与 watch(route.query, applyQuery) 并存，
 * 靠注释"由 watch 统一触发加载，避免重复请求"来兜底。
 *
 * 现在：**路由 query 是唯一状态源**（可分享、可前进后退），
 * 视图只绑定返回值，不自行 fetch。
 *
 * 两个加载态的区别（为保留"更新时旧列表降透明度"的体验）：
 * - `loading`：有请求在飞
 * - `refreshing`：请求在飞**且已有数据**，此时应保留旧列表并弱化显示
 */

export type ArticleSort = 'time' | 'hot';

export const DEFAULT_ARTICLE_LIMIT = 5;

export interface UseArticleQueryOptions {
  /** 每页条数 */
  limit?: number;
}

const normalizeSort = (value: unknown): ArticleSort =>
  value === 'hot' ? 'hot' : 'time';

const normalizePage = (value: unknown): number => {
  if (typeof value !== 'string') return 1;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
};

const normalizeTag = (value: unknown): string =>
  typeof value === 'string' ? value : '';

export function useArticleQuery(options: UseArticleQueryOptions = {}) {
  const limit = options.limit ?? DEFAULT_ARTICLE_LIMIT;

  const route = useRoute();
  const router = useRouter();

  const articles = ref<Article[]>([]);
  const pagination = ref<Pagination>({ page: 1, limit, total: 0, total_pages: 0 });
  const loading = ref(false);
  const error = ref('');

  // 查询参数由路由派生（单一状态源）
  const sort = computed<ArticleSort>(() => normalizeSort(route.query.sort));
  const page = computed<number>(() => normalizePage(route.query.page));
  const tag = computed<string>(() => normalizeTag(route.query.tag));

  /** 更新进行中且已有内容 → 保留旧列表并弱化显示 */
  const refreshing = computed(() => loading.value && articles.value.length > 0);

  /** 首次加载且尚无内容 */
  const initialLoading = computed(() => loading.value && articles.value.length === 0);

  /** 有错误且尚无内容（整块错误态） */
  const blockingError = computed(() => Boolean(error.value) && articles.value.length === 0);

  // 防止竞态：只有最后一次请求的结果可以写入状态
  let requestSeq = 0;

  async function load(): Promise<void> {
    const seq = ++requestSeq;
    loading.value = true;
    error.value = '';
    try {
      const res = await articleApi.getArticles({
        page: page.value,
        limit,
        sort: sort.value,
        ...(tag.value && { tag: tag.value }),
      });
      if (seq !== requestSeq) return; // 已有更新的请求，丢弃本次结果
      if (res.success) {
        articles.value = res.articles;
        pagination.value = res.pagination;
      }
    } catch (e) {
      if (seq !== requestSeq) return;
      console.error('加载文章失败:', e);
      error.value = '文章暂时没有加载出来';
    } finally {
      if (seq === requestSeq) {
        loading.value = false;
      }
    }
  }

  /** 供"重新加载"按钮使用 */
  const reload = () => load();

  /**
   * 导航：只改路由 query，由下方唯一 watch 触发加载。
   * 这样前进/后退、直接粘贴 URL、侧栏标签点击都走同一条路径。
   */
  const pushQuery = (overrides: { sort?: ArticleSort; page?: number; tag?: string | null }) => {
    const query: Record<string, string> = {};
    const nextSort = overrides.sort ?? sort.value;
    const nextPage = overrides.page ?? page.value;
    const nextTag = overrides.tag !== undefined ? overrides.tag : tag.value;

    // sort=time 与 page=1 是默认值，不写入 URL，保持地址简洁
    if (nextSort !== 'time') query.sort = nextSort;
    if (nextPage > 1) query.page = String(nextPage);
    if (nextTag) query.tag = nextTag;

    return router.replace({ query });
  };

  const setSort = (nextSort: ArticleSort) => {
    if (nextSort === sort.value && page.value === 1) return Promise.resolve();
    return pushQuery({ sort: nextSort, page: 1 });
  };

  const setPage = (nextPage: number) => {
    if (nextPage === page.value) return Promise.resolve();
    return pushQuery({ page: nextPage });
  };

  const setTag = (nextTag: string | null) => pushQuery({ tag: nextTag, page: 1 });

  // 唯一触发点：初始进入与 query 变化
  watch(
    () => route.query,
    () => {
      load();
    },
    { immediate: true }
  );

  return {
    // 状态
    articles: articles as Ref<Article[]>,
    pagination,
    loading,
    refreshing,
    initialLoading,
    blockingError,
    error,
    // 派生自路由的查询参数
    sort,
    page,
    tag,
    // 操作
    setSort,
    setPage,
    setTag,
    reload,
  };
}

<template>
  <div class="router-container">
    <div class="header">
      <div class="title-row">
        <span class="section-title">文章列表</span>
        <router-link to="/article/new" class="new-btn" v-if="userStore.isAdmin">
          <Button size="sm">写文章</Button>
        </router-link>
      </div>
      <div class="controls">
        <div class="sort-btns">
          <button :class="{ active: sort === 'time' }" @click="changeSort('time')">最新</button>
          <button :class="{ active: sort === 'hot' }" @click="changeSort('hot')">最热</button>
        </div>
        <div v-if="tag" class="tag-filter">
          <span class="tag-filter-label">标签：</span>
          <span class="tag-filter-name">{{ tag }}</span>
          <button class="tag-filter-clear" title="清除标签筛选" @click="clearTag">✕</button>
        </div>
      </div>
    </div>

    <div class="content">
      <!-- 首次加载（无内容时）才显示整块占位 -->
      <div v-if="loading && articles.length === 0" class="state">加载中...</div>
      <div v-else-if="error && articles.length === 0" class="state error">{{ error }}</div>
      <template v-else>
        <div v-if="error" class="inline-error">{{ error }}</div>

        <!-- Article list -->
        <div v-if="articles.length" class="list" :class="{ dimmed: loading }">
          <ArticleCard v-for="a in articles" :key="a.id" :article="a" />
        </div>
        <div v-else class="state">暂无文章</div>

        <Pagination
          :currentPage="page"
          :totalPages="pagination.total_pages"
          @page-change="handlePageChange"
        />
      </template>
    </div>

    <CommentBox sourceId="home" sourceType="page" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { articleApi } from '@/utils/api';
import { useUserStore } from '@/stores/user';
import ArticleCard from '@/components/ArticleCard.vue';
import Pagination from '@/components/Pagination.vue';
import Button from '@/components/Button.vue';
import CommentBox from '@/components/CommentBox.vue';
import type { Article, Pagination as PaginationType } from '@/types/article';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const articles = ref<Article[]>([]);
const pagination = ref<PaginationType>({ page: 1, limit: 5, total: 0, total_pages: 0 });
const loading = ref(true);
const error = ref('');
const sort = ref<'time' | 'hot'>('time');
const page = ref(1);
const tag = ref('');

// 构建查询参数（保留标签筛选）
function buildQuery(overrides: Record<string, string | number>) {
  const query: Record<string, string | number> = { ...overrides };
  if (tag.value) query.tag = tag.value;
  return query;
}

// 以下操作只更新路由查询参数，由watch统一触发加载，避免重复请求
function changeSort(newSort: 'time' | 'hot') {
  if (sort.value === newSort && page.value === 1) return;
  router.replace({ query: buildQuery({ sort: newSort, page: 1 }) });
}

function handlePageChange(p: number) {
  if (p === page.value) return;
  router.replace({ query: buildQuery({ sort: sort.value, page: p }) });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearTag() {
  router.replace({ query: { sort: sort.value, page: 1 } });
}

async function loadArticles() {
  loading.value = true;
  error.value = '';
  try {
    const listRes = await articleApi.getArticles({
      page: page.value,
      limit: 5,
      sort: sort.value,
      ...(tag.value && { tag: tag.value }),
    });
    if (listRes.success) {
      articles.value = listRes.articles;
      pagination.value = listRes.pagination;
    }
  } catch (e: any) {
    error.value = e.message || '加载失败';
  } finally {
    loading.value = false;
  }
}

function applyQuery() {
  const q = route.query;
  if (q.sort === 'hot' || q.sort === 'time') sort.value = q.sort;
  else sort.value = 'time';
  page.value = q.page ? Math.max(1, parseInt(q.page as string) || 1) : 1;
  tag.value = typeof q.tag === 'string' ? q.tag : '';
  loadArticles();
}

onMounted(() => {
  applyQuery();
});

// 查询参数变化（侧栏标签点击/排序/分页/清除标签）时统一重新加载
watch(
  () => route.query,
  () => {
    applyQuery();
  }
);
</script>

<style scoped>
.router-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  /* background-color: var(--bg-primary);
  border-radius: var(--radius-small);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out; */
}

.header {
  position: relative;
  padding: 20px 10px;
  /* border-bottom: 1px dashed var(--color-primary); */
}

.header::after {
  /* content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  width: 6px;
  border-radius: 3px;
  height: calc(100% - 20px);
  background-color: var(--color-primary);
  transition: background-color 0.2s ease-in-out; */
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.sort-btns {
  display: flex;
  gap: 0.5rem;
}

.sort-btns button {
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.sort-btns button.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* 标签筛选指示 */
.tag-filter {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.tag-filter-name {
  padding: 0.1rem 0.6rem;
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
  border-radius: var(--radius-medium);
}

.tag-filter-clear {
  padding: 0.05rem 0.4rem;
  font-size: 0.75rem;
  font-family: inherit;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-medium);
  cursor: pointer;
  transition: color 0.15s ease;
}

.tag-filter-clear:hover {
  color: #f5222d;
}

.content {
  /* 首次加载占位时保留一定高度，减少下方评论区的跳动 */
  min-height: 12rem;
}

/* 更新中：旧列表保留并降透明度，防止点击旧内容 */
.list.dimmed {
  opacity: 0.45;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.inline-error {
  padding: 0.5rem 1rem;
  text-align: center;
  font-size: 0.9rem;
  color: #f5222d;
}

.state {
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.state.error {
  color: #f5222d;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 10px 0;
}
</style>

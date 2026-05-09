<template>
  <div class="router-container">
    <div class="header">
      <div class="title-row">
        <span class="section-title">文章列表</span>
        <router-link to="/article/new" class="new-btn" v-if="userStore.isAuthenticated">
          <Button size="sm">写文章</Button>
        </router-link>
      </div>
      <div class="controls">
        <div class="sort-btns">
          <button :class="{ active: sort === 'time' }" @click="changeSort('time')">最新</button>
          <button :class="{ active: sort === 'hot' }" @click="changeSort('hot')">最热</button>
        </div>
      </div>
    </div>

    <div class="content">
      <div v-if="loading" class="state">加载中...</div>
      <div v-else-if="error" class="state error">{{ error }}</div>
      <template v-else>
        <!-- Top 3 featured articles -->
        <div class="featured" v-if="showFeatured && topArticles.length">
          <ArticleCard
            v-for="a in topArticles"
            :key="a.id"
            :article="a"
            class="featured-card"
          />
        </div>

        <!-- Article list -->
        <div v-if="articles.length" class="list">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { articleApi } from '@/utils/api';
import { useUserStore } from '@/stores/user';
import ArticleCard from '@/components/ArticleCard.vue';
import Pagination from '@/components/Pagination.vue';
import Button from '@/components/Button.vue';
import type { Article, Pagination as PaginationType } from '@/types/article';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const articles = ref<Article[]>([]);
const topArticles = ref<Article[]>([]);
const pagination = ref<PaginationType>({ page: 1, limit: 5, total: 0, total_pages: 0 });
const loading = ref(true);
const error = ref('');
const sort = ref<'time' | 'hot'>('time');
const page = ref(1);

const showFeatured = computed(() => page.value === 1 && sort.value === 'hot');

function changeSort(newSort: 'time' | 'hot') {
  sort.value = newSort;
  page.value = 1;
  router.replace({ query: { sort: newSort, page: 1 } });
  loadArticles();
}

function handlePageChange(p: number) {
  page.value = p;
  router.replace({ query: { sort: sort.value, page: p } });
  loadArticles();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadArticles() {
  loading.value = true;
  error.value = '';
  try {
    const [listRes, topRes] = await Promise.all([
      articleApi.getArticles({ page: page.value, limit: 5, sort: sort.value }),
      articleApi.getTopArticles(3),
    ]);
    if (listRes.success) {
      articles.value = listRes.articles;
      pagination.value = listRes.pagination;
    }
    if (topRes.success) {
      topArticles.value = topRes.data;
    }
  } catch (e: any) {
    error.value = e.message || '加载失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const q = route.query;
  if (q.sort === 'hot' || q.sort === 'time') sort.value = q.sort;
  if (q.page) page.value = Math.max(1, parseInt(q.page as string) || 1);
  loadArticles();
});
</script>

<style scoped>
.router-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  border-radius: var(--radius-small);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out;
}

.header {
  position: relative;
  padding: 10px 20px;
  border-bottom: 1px dashed var(--color-primary);
}

.header::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  width: 6px;
  border-radius: 3px;
  height: calc(100% - 20px);
  background-color: var(--color-primary);
  transition: background-color 0.2s ease-in-out;
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

.content {
  padding: 1rem;
}

.state {
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.state.error {
  color: #f5222d;
}

.featured {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed var(--border-color);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>

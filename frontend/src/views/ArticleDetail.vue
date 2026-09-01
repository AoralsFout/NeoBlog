<template>
  <div class="router-container">
    <div v-if="loading" class="state">加载中...</div>
    <div v-else-if="error" class="state error" role="alert">
      <strong>{{ error }}</strong>
      <button type="button" @click="loadArticle">重新加载</button>
    </div>
    <div v-else-if="!article" class="state">文章不存在</div>
    <template v-else>
      <div class="article-container">
        <div class="article-header">
          <div class="cover" v-if="article.cover_image">
            <img :src="article.cover_image" :alt="article.title" />
          </div>
          <h1 class="title">{{ article.title }}</h1>
          <div class="meta">
            <span class="author" v-if="article.author">
              <img v-if="article.author.avatar" :src="article.author.avatar" class="author-avatar" />
              {{ article.author.username }}
            </span>
            <span class="date">{{ formatDate(article.created_at) }}</span>
            <span class="views">{{ article.views }} 浏览</span>
            <span class="comments-count">{{ article.comment_count || 0 }} 评论</span>
          </div>
          <div class="tags" v-if="tagList.length">
            <span class="tag" v-for="tag in tagList" :key="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="article-content markdown-body" ref="contentRef" v-html="renderedContent"></div>
        <div class="article-footer">
          <Button v-if="canEdit" size="sm" @click="goEdit">编辑文章</Button>
          <Button size="sm" @click="goBack">返回</Button>
        </div>
      </div>
      <CommentBox :sourceId="String(article.id)" sourceType="article" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css';
import { articleApi } from '@/utils/api';
import { useArticleStore } from '@/stores/article';
import { useUserStore } from '@/stores/user';
import CommentBox from '@/components/CommentBox.vue';
import Button from '@/components/Button.vue';
import type { Article } from '@/types/article';

const route = useRoute();
const router = useRouter();
const articleStore = useArticleStore();
const userStore = useUserStore();

const article = ref<Article | null>(null);
const loading = ref(true);
const error = ref('');
const contentRef = ref<HTMLElement | null>(null);

const articleId = computed(() => Number(route.params.id));

const tagList = computed(() => {
  if (!article.value?.tags) return [];
  return article.value.tags.split(',').map((t) => t.trim()).filter(Boolean);
});

const canEdit = computed(() => {
  if (!article.value || !userStore.currentUser) return false;
  return article.value.author_id === userStore.currentUser.id || userStore.currentUser.role === 'admin';
});

const renderedContent = computed(() => {
  if (!article.value) return '';
  return renderMarkdown(article.value.content || '');
});

let headingIndex = 0;

const markedRenderer = new marked.Renderer();
markedRenderer.heading = function ({ text, depth }: { text: string; depth: number }) {
  const id = `heading-${headingIndex++}`;
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};
markedRenderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    } catch { }
  }
  return `<pre><code>${text}</code></pre>`;
};

marked.use({ renderer: markedRenderer, breaks: true, gfm: true });

function renderMarkdown(content: string): string {
  headingIndex = 0;
  const html = marked.parse(content) as string;
  // 清洗HTML，移除脚本等危险内容（防存储型XSS）
  return DOMPurify.sanitize(html, {
    // 高亮代码需要保留class属性
    FORBID_TAGS: ['style', 'form', 'input', 'iframe', 'object', 'embed'],
  });
}

function extractHeadings(content: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /<h([1-3])\s+id="(heading-\d+)"[^>]*>(.*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push({
      level: parseInt(match[1]!),
      id: match[2]!,
      text: match[3]!.replace(/<[^>]*>/g, ''),
    });
  }
  return headings;
}

function goEdit() {
  router.push(`/article/${articleId.value}/edit`);
}

function goBack() {
  // 有站内历史时返回上一页，否则回到文章列表
  if (window.history.state && (window.history.state as any).back) {
    router.back();
  } else {
    router.push('/articles');
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function loadArticle() {
  loading.value = true;
  error.value = '';
  try {
    const res = await articleApi.getArticleById(articleId.value);
    if (res.success && res.data) {
      article.value = res.data;
      const html = renderMarkdown(res.data.content);
      articleStore.setHeadings(extractHeadings(html));
    } else {
      error.value = '文章不存在';
    }
  } catch (e: any) {
    console.error('加载文章失败:', e);
    error.value = '这篇文章暂时没有加载出来';
  } finally {
    loading.value = false;
  }
}

watch(articleId, () => loadArticle());
onMounted(() => loadArticle());
onBeforeUnmount(() => articleStore.clearHeadings());
</script>

<style scoped>
.router-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  /* background-color: var(--bg-primary);
  border-radius: var(--radius-small);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out; */
}

.state {
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
  background-color: var(--surface-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-card);
  transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out;
}

.state.error {
  display: grid;
  justify-items: center;
  gap: 0.8rem;
  color: var(--text-secondary);
}

.state.error strong {
  color: var(--text-primary);
}

.state.error button {
  min-height: 40px;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-small);
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
}

.article-header {
  padding: 1.5rem 1.5rem 0;
}

.article-container {
  background-color: var(--surface-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-card);
  transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out;
}

.cover {
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: var(--radius-medium);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title {
  font-size: clamp(1.9rem, 4vw, 2.8rem);
  font-weight: bold;
  margin: 0 0 1rem;
  line-height: 1.2;
  letter-spacing: -0.05em;
  color: var(--text-primary);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  align-items: center;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.6rem;
  border-radius: var(--radius-medium);
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}

.article-content {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0.75rem 1.5rem 2rem;
  font-size: 1.02rem;
}

.article-footer {
  padding: 0.9rem 1.5rem;
  border-top: 1px dashed var(--border-color);
}

/* Markdown content styles */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  scroll-margin-top: 80px;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-body :deep(h1) {
  font-size: 1.6rem;
}

.markdown-body :deep(h2) {
  font-size: 1.3rem;
}

.markdown-body :deep(h3) {
  font-size: 1.1rem;
}

.markdown-body :deep(p) {
  line-height: 1.8;
  margin-bottom: 1rem;
}

.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-medium);
}

.markdown-body :deep(pre) {
  border-radius: var(--radius-medium);
  overflow-x: auto;
}

.markdown-body :deep(code) {
  font-family: 'Jetbrains Mono', 'Maple Mono CN', monospace;
  font-size: 0.85rem;
}

.markdown-body :deep(code)::-webkit-scrollbar { 
  height: 4px;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-secondary);
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

@media (max-width: 768px) {
  .article-header,
  .article-content,
  .article-footer {
    padding-right: 1.1rem;
    padding-left: 1.1rem;
  }

  .article-header {
    padding-top: 1.2rem;
  }

  .article-content {
    padding-bottom: 2rem;
    font-size: 0.98rem;
  }

  .markdown-body :deep(table) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--border-color);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.markdown-body :deep(th) {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}
</style>

<template>
  <Card class="article-card" @click="goDetail">
    <template #header>
      <div class="card-title">{{ article.title }}</div>
    </template>
    <template #body>
      <div class="card-body-content">
        <div class="cover" v-if="article.cover_image">
          <img :src="article.cover_image" :alt="article.title" />
        </div>
        <p class="summary">{{ article.summary || '暂无摘要' }}</p>
        <div class="meta">
          <div class="tags" v-if="tagList.length">
            <span class="tag" v-for="tag in tagList" :key="tag">{{ tag }}</span>
          </div>
          <div class="info">
            <span class="author" v-if="article.author">{{ article.author.username }}</span>
            <span class="date">{{ formatDate(article.created_at) }}</span>
            <span class="views">{{ article.views }} 浏览</span>
            <span class="comments-count">{{ article.comment_count || 0 }} 评论</span>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Card from './Card.vue';
import type { Article } from '@/types/article';

const props = defineProps<{
  article: Article;
}>();

const router = useRouter();

const tagList = computed(() => {
  if (!props.article.tags) return [];
  return props.article.tags.split(',').map((t) => t.trim()).filter(Boolean);
});

function goDetail() {
  router.push(`/article/${props.article.id}`);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
</script>

<style scoped>
.article-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12);
}

.card-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-body-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cover {
  width: 100%;
  max-height: 200px;
  overflow: hidden;
  border-radius: var(--radius-medium);
  display: flex;
  justify-content: center;
  align-items: center;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.summary {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.tags {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.6rem;
  border-radius: var(--radius-medium);
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}

.info {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}
</style>

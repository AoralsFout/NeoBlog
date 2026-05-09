<template>
  <div class="router-container">
    <div class="header">
      <span>{{ isEdit ? '编辑文章' : '写文章' }}</span>
    </div>
    <div class="content">
      <div v-if="loading" class="state">加载中...</div>
      <div v-else-if="!userStore.isAuthenticated" class="state">请先登录</div>
      <form v-else class="editor-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label>标题</label>
          <input v-model="title" type="text" placeholder="文章标题" required maxlength="200" />
        </div>
        <div class="field">
          <label>标签（逗号分隔）</label>
          <input v-model="tags" type="text" placeholder="例如: 技术, 前端, Vue" />
        </div>
        <div class="field">
          <label>摘要</label>
          <textarea v-model="summary" placeholder="简短描述..." rows="2" maxlength="500"></textarea>
        </div>
        <div class="field">
          <label>封面图 URL</label>
          <input v-model="cover_image" type="text" placeholder="https://..." />
        </div>
        <div class="field">
          <div class="label-row">
            <label>内容（Markdown）</label>
            <button type="button" class="preview-toggle" @click="preview = !preview">
              {{ preview ? '编辑' : '预览' }}
            </button>
          </div>
          <textarea
            v-if="!preview"
            v-model="content"
            placeholder="使用 Markdown 格式..."
            rows="20"
            required
            class="content-input"
          ></textarea>
          <div v-else class="markdown-preview markdown-body" v-html="renderedPreview"></div>
        </div>
        <div class="actions">
          <Button :loading="submitting">{{ isEdit ? '保存修改' : '发布文章' }}</Button>
          <button type="button" class="cancel-btn" @click="goBack">取消</button>
        </div>
        <div v-if="submitError" class="submit-error">{{ submitError }}</div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css';
import { articleApi } from '@/utils/api';
import { useUserStore } from '@/stores/user';
import Button from '@/components/Button.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const isEdit = computed(() => !!route.params.id && route.path.includes('/edit'));
const articleId = computed(() => (isEdit.value ? Number(route.params.id) : null));

const title = ref('');
const content = ref('');
const summary = ref('');
const cover_image = ref('');
const tags = ref('');
const preview = ref(false);
const loading = ref(false);
const submitting = ref(false);
const submitError = ref('');

const renderedPreview = computed(() => {
  if (!content.value) return '';
  return marked.parse(content.value) as string;
});

function goBack() {
  if (isEdit.value) {
    router.push(`/article/${articleId.value}`);
  } else {
    router.push('/articles');
  }
}

async function handleSubmit() {
  if (!title.value.trim() || !content.value.trim()) return;
  submitting.value = true;
  submitError.value = '';

  try {
    const data = {
      title: title.value.trim(),
      content: content.value.trim(),
      summary: summary.value.trim() || undefined,
      cover_image: cover_image.value.trim() || undefined,
      tags: tags.value.trim() || undefined,
    };

    if (isEdit.value) {
      await articleApi.updateArticle(articleId.value!, data);
      router.push(`/article/${articleId.value}`);
    } else {
      const res = await articleApi.createArticle(data);
      if (res.success && res.data) {
        router.push(`/article/${res.data.id}`);
      }
    }
  } catch (e: any) {
    submitError.value = e.message || '提交失败';
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true;
    try {
      const res = await articleApi.getArticleById(articleId.value!);
      if (res.success && res.data) {
        const a = res.data;
        title.value = a.title;
        content.value = a.content;
        summary.value = a.summary || '';
        cover_image.value = a.cover_image || '';
        tags.value = a.tags || '';
      }
    } catch (e: any) {
      submitError.value = '加载文章失败';
    } finally {
      loading.value = false;
    }
  }
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
  font-size: 16px;
  font-weight: bold;
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

.content {
  padding: 1.5rem;
}

.state {
  padding: 3rem;
  text-align: center;
  color: var(--text-secondary);
}

.editor-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.field input,
.field textarea {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.content-input {
  min-height: 400px;
  font-family: 'Jetbrains Mono', 'Maple Mono CN', monospace !important;
  font-size: 0.9rem !important;
  line-height: 1.6;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-toggle {
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.8rem;
}

.markdown-preview {
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  min-height: 400px;
  background: var(--bg-secondary);
}

.actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-small);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  color: var(--text-on-color);
  background-color: var(--color-primary);
}

.submit-error {
  color: #f5222d;
  font-size: 0.9rem;
}

/* Markdown preview styles */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-body :deep(p) { line-height: 1.8; margin-bottom: 0.8rem; }
.markdown-body :deep(pre) { border-radius: var(--radius-medium); overflow-x: auto; }
.markdown-body :deep(code) { font-family: 'Jetbrains Mono', 'Maple Mono CN', monospace; font-size: 0.85rem; }
.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
  color: var(--text-secondary);
}
</style>

<template>
  <div class="router-container">
    <div class="header">
      <span>{{ isEdit ? '编辑文章' : '写文章' }}</span>
    </div>
    <div class="content">
      <div v-if="loading" class="state">加载中...</div>
      <div v-else-if="!userStore.isAdmin" class="state">需要管理员权限</div>
      <form v-else class="editor-form" @submit.prevent="onFormSubmit" @keydown.enter="onFormEnter">
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
          <textarea v-if="!preview" v-model="content" placeholder="使用 Markdown 格式..." rows="20" required
            class="content-input"></textarea>
          <div v-else class="markdown-preview markdown-body" v-html="renderedPreview"></div>
        </div>
        <div class="actions">
          <Button native-type="submit" :loading="submitting" @click="markSubmitIntent">{{ isEdit ? '保存修改' : '发布文章' }}</Button>
          <Button type="outline" native-type="button" @click.prevent="goBack">取消</Button>
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
import DOMPurify from 'dompurify';
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
  const html = marked.parse(content.value) as string;
  // 预览同样需要清洗，防止粘贴的恶意HTML在编辑页执行
  return DOMPurify.sanitize(html);
});

function goBack() {
  if (isEdit.value) {
    router.push(`/article/${articleId.value}`);
  } else {
    router.push('/articles');
  }
}

// 提交意图标记：只有用户主动点击“发布/保存”或在输入框按回车时才允许提交。
// 表单内其他按钮（如取消）以任何方式触发的submit事件都会被忽略，避免误创建/覆盖文章。
let submitIntent = false;

function markSubmitIntent() {
  submitIntent = true;
}

function onFormSubmit() {
  if (!submitIntent) {
    return;
  }
  submitIntent = false;
  handleSubmit();
}

function onFormEnter(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  // 仅在文本输入框内回车时提交；textarea回车为换行，不拦截
  if (target && target.tagName === 'INPUT') {
    e.preventDefault();
    handleSubmit();
  }
}

async function handleSubmit() {
  // 防止重复提交（按钮disabled挡不住键盘触发的submit）
  if (submitting.value) return;
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
      // view=false：编辑器加载不增加浏览量
      const res = await articleApi.getArticleById(articleId.value!, false);
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

.markdown-body :deep(p) {
  line-height: 1.8;
  margin-bottom: 0.8rem;
}

.markdown-body :deep(pre) {
  border-radius: var(--radius-medium);
  overflow-x: auto;
}

.markdown-body :deep(code) {
  font-family: 'Jetbrains Mono', 'Maple Mono CN', monospace;
  font-size: 0.85rem;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
  color: var(--text-secondary);
}
</style>

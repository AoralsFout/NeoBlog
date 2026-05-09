<template>
  <div class="pagination" v-if="totalPages > 1">
    <button class="page-btn" :disabled="currentPage <= 1" @click="goPage(currentPage - 1)">
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
    </button>
    <button
      v-for="page in displayPages"
      :key="page"
      class="page-btn"
      :class="{ active: page === currentPage, ellipsis: page === -1 }"
      :disabled="page === -1"
      @click="page !== -1 && goPage(page)"
    >{{ page === -1 ? '...' : page }}</button>
    <button class="page-btn" :disabled="currentPage >= totalPages" @click="goPage(currentPage + 1)">
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  (e: 'page-change', page: number): void;
}>();

const displayPages = computed(() => {
  const pages: number[] = [];
  const total = props.totalPages;
  const current = props.currentPage;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  if (current > 3) pages.push(-1);

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push(-1);
  pages.push(total);

  return pages;
});

function goPage(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page);
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled):not(.ellipsis):not(.active) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.page-btn.ellipsis {
  border: none;
  cursor: default;
}
</style>

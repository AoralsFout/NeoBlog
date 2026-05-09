<template>
  <Card v-if="headings.length > 0">
    <template #header>
      <div>目录</div>
    </template>
    <template #body>
      <div class="toc-body">
        <a
          v-for="h in headings"
          :key="h.id"
          :class="['toc-item', `level-${h.level}`, { active: activeId === h.id }]"
          :href="`#${h.id}`"
          @click.prevent="scrollTo(h.id)"
        >{{ h.text }}</a>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Card from './Card.vue';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

const props = defineProps<{
  headings: TocHeading[];
}>();

const activeId = ref('');

let observer: IntersectionObserver | null = null;

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

onMounted(() => {
  const headingElements = props.headings
    .map((h) => document.getElementById(h.id))
    .filter(Boolean) as HTMLElement[];

  if (headingElements.length === 0) return;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id;
          break;
        }
      }
    },
    { rootMargin: '-80px 0px -60% 0px' }
  );

  headingElements.forEach((el) => observer!.observe(el));
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.toc-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 60vh;
  overflow-y: auto;
}

.toc-item {
  text-decoration: none;
  font-size: 0.85rem;
  color: var(--text-secondary);
  padding: 0.2rem 0;
  transition: color 0.2s ease;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-item:hover,
.toc-item.active {
  color: var(--color-primary);
}

.toc-item.level-2 {
  padding-left: 1rem;
}

.toc-item.level-3 {
  padding-left: 2rem;
}
</style>

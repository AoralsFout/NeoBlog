import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { TocHeading } from '@/components/TableOfContents.vue';

export const useArticleStore = defineStore('article', () => {
  const headings = ref<TocHeading[]>([]);

  function setHeadings(h: TocHeading[]) {
    headings.value = h;
  }

  function clearHeadings() {
    headings.value = [];
  }

  return { headings, setHeadings, clearHeadings };
});

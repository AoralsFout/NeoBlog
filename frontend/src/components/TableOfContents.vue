<template>
  <div class="toc-container">
    <Card v-if="headings.length > 0" class="toc-sticky">
      <template #header>
        <div>目录</div>
      </template>
      <template #body>
        <div class="toc-body">
          <a v-for="h in headings" :key="h.id" :class="['toc-item', `level-${h.level}`, { active: activeId === h.id }]"
            :href="`#${h.id}`" @click.prevent="scrollTo(h.id)"
            @mouseenter="showTip($event, h.text)" @mouseleave="hideTip">{{ h.text }}</a>
        </div>
      </template>
    </Card>
    <teleport to="body">
      <transition name="toc-tip">
        <div v-if="tipVisible" ref="tooltipRef" class="toc-tooltip"
          :style="{ top: tipTop + 'px', left: tipLeft + 'px' }">{{ tipText }}</div>
      </transition>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
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

// ===== 自定义悬浮提示（替代浏览器默认title） =====
const tipVisible = ref(false);
const tipText = ref('');
const tipTop = ref(0);
const tipLeft = ref(0);
const tooltipRef = ref<HTMLElement | null>(null);

function hideTip() {
  tipVisible.value = false;
  document.removeEventListener('scroll', hideTip, true);
}

async function showTip(event: MouseEvent, text: string) {
  const el = event.currentTarget as HTMLElement;
  // 未截断时不显示提示
  if (el.scrollWidth <= el.clientWidth) {
    return;
  }

  tipText.value = text;
  tipVisible.value = true;
  // 页面滚动或目录内部滚动时立即隐藏，避免提示错位
  document.addEventListener('scroll', hideTip, true);

  await nextTick();

  const tooltip = tooltipRef.value;
  if (!tooltip) return;

  const rect = el.getBoundingClientRect();
  const width = tooltip.offsetWidth;
  const height = tooltip.offsetHeight;

  // 默认放在条目右侧、垂直居中
  let left = rect.right + 8;
  let top = rect.top + rect.height / 2;

  // 右侧空间不足时翻转到条目左侧
  if (left + width > window.innerWidth - 8) {
    left = rect.left - width - 8;
    if (left < 8) left = 8;
  }

  // 垂直方向钳制在视口内
  if (top - height / 2 < 8) {
    top = 8 + height / 2;
  } else if (top + height / 2 > window.innerHeight - 8) {
    top = window.innerHeight - 8 - height / 2;
  }

  tipTop.value = top;
  tipLeft.value = left;
}

// 建立/重建观察器（文章切换时headings会变化）
async function setupObserver() {
  observer?.disconnect();
  observer = null;
  activeId.value = '';

  await nextTick();

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
}

onMounted(() => {
  setupObserver();
});

// 文章切换（路由参数变化导致headings更新）时重建观察器
watch(
  () => props.headings,
  () => {
    setupObserver();
  }
);

onBeforeUnmount(() => {
  observer?.disconnect();
  document.removeEventListener('scroll', hideTip, true);
});
</script>

<style scoped>
.toc-container {
  position: relative;
  height: 100%;
}

/* 粘性目录：跟随页面滚动停留在导航栏下方 */
.toc-sticky {
  position: sticky;
  top: calc(2rem + 70px);
  z-index: 5;
}

.toc-body {
  margin: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.toc-body::-webkit-scrollbar {
  width: 2px;
}

.toc-item {
  overflow: hidden;
  text-decoration: none;
  font-size: 0.85rem;
  color: var(--text-secondary);
  padding: 0.2rem 0;
  transition: color 0.2s ease;
  display: block;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
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

/* 自定义悬浮提示（teleport到body，随条目定位） */
.toc-tooltip {
  position: fixed;
  z-index: 9998;
  max-width: 22rem;
  padding: 0.4rem 0.75rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-medium);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  font-size: 0.8rem;
  line-height: 1.6;
  overflow-wrap: anywhere;
  transform: translateY(-50%);
  pointer-events: none;
}

.toc-tip-enter-active,
.toc-tip-leave-active {
  transition: opacity 0.12s ease;
}

.toc-tip-enter-from,
.toc-tip-leave-to {
  opacity: 0;
}
</style>

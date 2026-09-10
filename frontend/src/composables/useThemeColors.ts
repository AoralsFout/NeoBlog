import { ref, watch, onScopeDispose, getCurrentScope, type Ref } from 'vue';
import { useThemeStore } from '@/stores/theme';

/**
 * 主题颜色的缓存读取。
 *
 * 背景：useWaveAnimation 与 MusicPlayer 的频谱绘制都在**每个动画帧**里调用
 * getComputedStyle(document.documentElement) 反复解析 CSS 变量，
 * 而主题色只在用户切换主题时变化。
 *
 * 这里改为：订阅主题 store，仅在主题变化时重新读取并缓存解析结果。
 * 令牌用 MutationObserver 监听 <html> 的 data-theme 属性，
 * 以便覆盖"绕过 store 直接改属性"的情况。
 */

export interface ThemeColors {
  /** --color-primary 的原始值，如 "#eb2f96" */
  primary: string;
  /** --bg-secondary 的原始值 */
  bgSecondary: string;
}

const FALLBACK: ThemeColors = {
  primary: '#333333',
  bgSecondary: '#f8f9fa',
};

/** 读取 <html> 上的主题相关 CSS 变量 */
const readFromDom = (): ThemeColors => {
  if (typeof document === 'undefined') return { ...FALLBACK };
  const style = getComputedStyle(document.documentElement);
  return {
    primary: style.getPropertyValue('--color-primary').trim() || FALLBACK.primary,
    bgSecondary: style.getPropertyValue('--bg-secondary').trim() || FALLBACK.bgSecondary,
  };
};

/** 把 "#rrggbb" 解析为 RGB 三元组；解析失败时给出兜底色 */
export const parseHexColor = (
  hex: string,
  fallback: readonly [number, number, number] = [100, 100, 255]
): [number, number, number] => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return [fallback[0], fallback[1], fallback[2]];
  const value = match[1]!;
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
};

/**
 * 返回响应式的主题颜色缓存。
 *
 * 必须在组件/effect 作用域内调用（内部使用 onScopeDispose 清理监听）。
 */
export function useThemeColors(): Ref<ThemeColors> {
  const themeStore = useThemeStore();
  const colors = ref<ThemeColors>(readFromDom());

  const refresh = () => {
    colors.value = readFromDom();
  };

  // 主题 store 变化时刷新
  watch(() => themeStore.theme, refresh);

  // 兜底：外部直接改 <html data-theme> 时也刷新
  let observer: MutationObserver | null = null;
  if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
    observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      observer?.disconnect();
      observer = null;
    });
  }

  return colors;
}

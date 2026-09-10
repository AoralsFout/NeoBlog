import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * 桌面布局偏好（栏数）
 *
 * 只表达用户偏好；响应式降级（≤1024px 强制两栏、≤768px 强制单栏）
 * 完全由 CSS 的 media query 决定，这里不再参与窗口宽度计算。
 */
export type LayoutName = '2' | '3';

export const DEFAULT_LAYOUT: LayoutName = '3';

export const isLayoutName = (value: unknown): value is LayoutName =>
    value === '2' || value === '3';

export const useLayoutStore = defineStore("layout", () => {
    const layout = ref<LayoutName>(DEFAULT_LAYOUT);

    const initLayout = () => {
        // localStorage 中可能是历史遗留的非法值，需回退到默认，
        // 否则 data-layout 不匹配任何 CSS 规则，布局会退化为无 grid-area 的堆叠
        const saved = localStorage.getItem("layout");
        layout.value = isLayoutName(saved) ? saved : DEFAULT_LAYOUT;
    }

    const setLayout = (tar: string) => {
        const next = isLayoutName(tar) ? tar : DEFAULT_LAYOUT;
        layout.value = next;
        localStorage.setItem("layout", next);
    }

    return { layout, setLayout, initLayout };
});

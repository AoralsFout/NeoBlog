import { defineStore } from "pinia";
import { ref } from "vue";
import { isThemeName, type ThemeName } from "@/utils/appearance";

/**
 * 主题色偏好
 *
 * 与圆角一致：JS 只写一个 data-theme 属性，具体颜色变量定义在
 * assets/themes/<name>.css 的 [data-theme="<name>"] 块中。
 * 档位定义集中在 utils/appearance.ts 的 THEME_OPTIONS。
 */
export const useThemeStore = defineStore("theme", () => {
    // 默认主题为黑或粉
    const theme = ref<ThemeName>("pink");

    const getSystemTheme = (): ThemeName => {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return isDark ? "dark" : "pink";
    };

    const initTheme = () => {
        // localStorage 中可能是历史遗留的非法值，需回退到系统主题，
        // 否则 data-theme 会指向不存在的主题块，页面丢失全部配色变量
        const saved = localStorage.getItem("theme");
        setTheme(isThemeName(saved) ? saved : getSystemTheme());
    }

    const setTheme = (themeName?: string) => {
        const next = isThemeName(themeName) ? themeName : getSystemTheme();
        theme.value = next;
        localStorage.setItem("theme", next);
        document.documentElement.setAttribute("data-theme", next);
    }

    return { theme, initTheme, setTheme };
});

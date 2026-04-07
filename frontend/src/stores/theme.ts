import { defineStore } from "pinia";
import { ref } from "vue";

export const useThemeStore = defineStore("theme", () => {
    // 默认主题为黑或粉
    const theme = ref("pink");

    const getSystemTheme = () => {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return isDark ? "dark" : "pink";
    };

    const initTheme = () => {
        theme.value = localStorage.getItem("theme") || getSystemTheme();
        document.documentElement.setAttribute("data-theme", theme.value);
        setTheme();
    }

    const setTheme = (themeName?: string) => {
        if (themeName) {
            theme.value = themeName;
        }
        localStorage.setItem("theme", theme.value);
        document.documentElement.setAttribute("data-theme", theme.value);
    }

    return { theme, initTheme, setTheme };
});
import { defineStore } from "pinia";
import { ref } from "vue";
import { DEFAULT_RADIUS, isRadiusName, type RadiusName } from "@/utils/appearance";

/**
 * 圆角偏好
 *
 * 历史：本 store 曾在 JS 中维护 radiusArray 表格并 switch 三档，
 * 用 document.documentElement.style.setProperty 逐个写入 --radius-*。
 * 现在只写一个 data-radius 属性，具体变量映射由 CSS 表达
 * （见 assets/themes/root.css 的 [data-radius] 块），
 * 与 data-theme 的下发方式保持一致。
 */
export const useRadiusStore = defineStore("radius", () => {
    const radius = ref<RadiusName>(DEFAULT_RADIUS);

    const initRadius = () => {
        const saved = localStorage.getItem("radius");
        setRadius(isRadiusName(saved) ? saved : DEFAULT_RADIUS);
    }

    const setRadius = (radiusName: RadiusName) => {
        const next = isRadiusName(radiusName) ? radiusName : DEFAULT_RADIUS;
        radius.value = next;
        localStorage.setItem("radius", next);
        document.documentElement.setAttribute("data-radius", next);
    }

    return { radius, setRadius, initRadius };
});

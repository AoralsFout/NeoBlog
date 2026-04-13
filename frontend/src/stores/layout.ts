import { defineStore } from "pinia";
import { ref } from "vue";

export const useLayoutStore = defineStore("layout", () => {
    const layout = ref('3');

    const initLayout = () => {
        layout.value = localStorage.getItem("layout") || '3';
    }

    const setLayout = (tar: string) => {
        layout.value = tar;
        localStorage.setItem("layout", tar.toString());
    }

    return { layout, setLayout, initLayout };
});
import { defineStore } from "pinia";
import { ref } from "vue";

const radiusArray = [
    ["4px", "8px", "12px"],
    ["8px", "12px", "16px"],
    ["12px", "16px", "20px"]
]

export const useRadiusStore = defineStore("radius", () => {
    const radius = ref("small");
    
    const initRadius = () => {
        const savedRadius = localStorage.getItem("radius") || "small";
        radius.value = savedRadius;
        setRadius(savedRadius);
    }

    const setRadius = (radiusName?: string) => {
        if (radiusName) {
            radius.value = radiusName;
        }
        localStorage.setItem("radius", radius.value);
        
        let array: string[] = [];
        switch (radius.value) {
            case "small":
                array = radiusArray[0]!;
                break;
            case "medium":
                array = radiusArray[1]!;
                break;
            case "large":
                array = radiusArray[2]!;
                break;
            default:
                array = radiusArray[0]!; // 默认值
        }
        
        document.documentElement.style.setProperty("--radius-small", array[0]!);
        document.documentElement.style.setProperty("--radius-medium", array[1]!);
        document.documentElement.style.setProperty("--radius-large", array[2]!);
    }

    return { radius, initRadius, setRadius };
});
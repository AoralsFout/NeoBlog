<template>
    <div class="FooterContainer" ref="footerContainer" :style="'boxShadow:inner'">
        <div class="FooterContent"
            :style="'transform:translateX(' + offset + 'px);' + (dragging ? '' : 'transition: transform 0.2s ease-in-out;')">
            <div class="FooterHandle" v-on:mousedown="handleMousedown">
            </div>
            <div>AoralsFoutの小窝</div>
            <div>© {{ currentYear }} AoralsFout</div>
            <div><a href="https://beian.miit.gov.cn/" target="_blank">冀ICP备2026011544号</a></div>
            <div>
                <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
                    <path
                        d="M416 160a64 64 0 1 0-96.27 55.24c-2.29 29.08-20.08 37-75 48.42c-17.76 3.68-35.93 7.45-52.71 13.93v-126.2a64 64 0 1 0-64 0v209.22a64 64 0 1 0 64.42.24c2.39-18 16-24.33 65.26-34.52c27.43-5.67 55.78-11.54 79.78-26.95c29-18.58 44.53-46.78 46.36-83.89A64 64 0 0 0 416 160zM160 64a32 32 0 1 1-32 32a32 32 0 0 1 32-32zm0 384a32 32 0 1 1 32-32a32 32 0 0 1-32 32zm192-256a32 32 0 1 1 32-32a32 32 0 0 1-32 32z"
                        fill="currentColor"></path>
                </svg>

                <span>Build {{ gitHash }} - {{ formattedDate }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const currentYear = new Date().getFullYear()

const gitHash = __GIT_HASH__;
const gitDate = __GIT_DATE__;

const formattedDate = new Date(gitDate).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
});

const footerContainer = ref<HTMLElement | null>(null);
const offset = ref(0);
const dragging = ref(false);
const lastX = ref(0);
const lastOffset = ref(0);

const handleMousedown = (e: MouseEvent) => {
    lastX.value = e.clientX;
    dragging.value = true;
};

const handleMousemove = (e: MouseEvent) => {
    if (dragging.value) {
        offset.value = lastOffset.value - (lastX.value - e.clientX);
        if (offset.value > 0) {
            offset.value = 0;
        }
        if (footerContainer.value && offset.value < -footerContainer.value.clientWidth + 25) {
            offset.value = -footerContainer.value.clientWidth + 25;
        }
    }
};

const handleMouseup = (e: MouseEvent) => {
    dragging.value = false;

    if (footerContainer.value) {
        if (offset.value < -footerContainer.value.clientWidth / 2 && lastOffset.value < -footerContainer.value.clientWidth / 2) {
            open();
        } else if (offset.value > -footerContainer.value.clientWidth / 2 && lastOffset.value > -footerContainer.value.clientWidth / 2) {
            close();
        } else if (offset.value > -footerContainer.value.clientWidth / 2 && lastOffset.value < -footerContainer.value.clientWidth / 2) {
            close();
        } else if (offset.value < -footerContainer.value.clientWidth / 2 && lastOffset.value > -footerContainer.value.clientWidth / 2) {
            open();
        }
    }

    lastOffset.value = offset.value;
};

const reverseMapToUnit = (x: number) => {
    if (footerContainer.value) {
        return x / (-footerContainer.value.clientWidth + 25) * 20;
    } else {
        return x;
    }
}

const open = () => {
    offset.value = -footerContainer.value!.clientWidth + 25;
};

const close = () => {
    offset.value = 0;
};

onMounted(() => {
    window.addEventListener('mousemove', handleMousemove);
    window.addEventListener('mouseup', handleMouseup);
});

onUnmounted(() => {
    window.removeEventListener('mousemove', handleMousemove);
    window.removeEventListener('mouseup', handleMouseup);
});
</script>

<style scoped>
.FooterContainer {
    margin-top: 2rem;
    overflow: hidden;
    background-image: url('/bg.png');
    background-size: contain;
    background-position: center;
    background-repeat: repeat;
    box-shadow: inset 0 0 5px 5px rgba(0, 0, 0, 0.4);
    z-index: 1;
}

.FooterContent {
    position: relative;
    padding: 1rem calc(1rem + 20px) 1rem 1rem;
    color: var(--text-secondary);
    border-top: 1px dashed var(--color-primary);
    border-bottom: 1px dashed var(--color-primary);
    font-size: 0.8125rem;
    line-height: 1.5;
    user-select: none;
    webkit-user-select: none;
    background-color: var(--bg-secondary);
    z-index: 0;
}

.FooterContent>div {
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.FooterContent>div:last-child {
    margin-bottom: 0;
}

.FooterContent a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s ease;
}

.FooterContent a:hover {
    color: var(--text-tertiary, #4da6ff);
    text-decoration: none;
}

.FooterContent svg {
    color: var(--text-tertiary);
    flex-shrink: 0;
}

.FooterHandle {
    margin: 0 !important;
    position: absolute;
    background-color: var(--color-tertiary);
    height: 40px;
    width: 35px;
    border-radius: 5px;
    top: 50%;
    transform: translateY(-50%);
    right: -10px;
}

/* 桌面布局：水平排列 */
@media (min-width: 768px) {
    .FooterContent {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
    }

    .FooterContent>div {
        margin-bottom: 0;
        margin-right: 1.5rem;
    }

    .FooterContent>div:last-child {
        margin-right: 0;
    }
}

/* 小屏幕：垂直居中 */
@media (max-width: 767px) {
    .FooterContent {
        text-align: center;
    }

    .FooterContent>div {
        justify-content: center;
    }
}
</style>
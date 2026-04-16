<template>
    <div class="FooterContainer">
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
</template>

<script setup lang="ts">
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
</script>

<style scoped>
.FooterContainer {
    margin-top: 2rem;
    padding: 1.5rem 1rem;
    background-color: transparent;
    color: var(--text-secondary);
    border-top: 1px dashed var(--color-primary);
    font-size: 0.8125rem;
    line-height: 1.5;
}

.FooterContainer > div {
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.FooterContainer > div:last-child {
    margin-bottom: 0;
}

.FooterContainer a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s ease;
}

.FooterContainer a:hover {
    color: var(--text-tertiary, #4da6ff);
    text-decoration: none;
}

.FooterContainer svg {
    color: var(--text-tertiary);
    flex-shrink: 0;
}

/* 桌面布局：水平排列 */
@media (min-width: 768px) {
    .FooterContainer {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
    }

    .FooterContainer > div {
        margin-bottom: 0;
        margin-right: 1.5rem;
    }

    .FooterContainer > div:last-child {
        margin-right: 0;
    }
}

/* 小屏幕：垂直居中 */
@media (max-width: 767px) {
    .FooterContainer {
        text-align: center;
    }

    .FooterContainer > div {
        justify-content: center;
    }
}
</style>
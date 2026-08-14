<template>
    <div class="nf-page">
        <div class="nf-glow nf-glow-1"></div>
        <div class="nf-glow nf-glow-2"></div>
        <div class="nf-card">
            <div class="nf-code">404</div>
            <div class="nf-divider"></div>
            <h1 class="nf-title">页面走丢了</h1>
            <p class="nf-desc">你访问的页面不存在或已被移除，请检查地址是否正确。</p>
            <div class="nf-actions">
                <Button size="lg" @click="goHome">返回首页</Button>
                <Button type="outline" size="lg" @click="goBack">返回上一页</Button>
            </div>
            <div class="nf-hint">NeoBlog · 404 Not Found</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Button from '@/components/Button.vue';

const router = useRouter();

const goHome = () => {
    router.push('/');
};

const goBack = () => {
    // 有站内历史时返回上一页，否则回首页
    if (window.history.state && (window.history.state as any).back) {
        router.back();
    } else {
        router.push('/');
    }
};

onMounted(() => {
    document.title = '页面不存在 - NeoBlog';
});

onBeforeUnmount(() => {
    document.title = 'NeoBlog';
});
</script>

<style scoped>
.nf-page {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    box-sizing: border-box;
    background-color: var(--bg-secondary);
    overflow: hidden;
}

/* 背景装饰光斑 */
.nf-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.18;
    pointer-events: none;
}

.nf-glow-1 {
    width: 320px;
    height: 320px;
    top: -80px;
    left: -60px;
    background-color: var(--color-primary);
    animation: nf-float 8s ease-in-out infinite;
}

.nf-glow-2 {
    width: 400px;
    height: 400px;
    bottom: -120px;
    right: -80px;
    background-color: var(--color-secondary);
    animation: nf-float 10s ease-in-out infinite reverse;
}

.nf-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.25rem;
    width: 100%;
    max-width: 34rem;
    padding: 3rem 2rem;
    background-color: var(--bg-primary);
    border-radius: var(--radius-large);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out;
}

/* 大号404数字，主题色渐变 */
.nf-code {
    font-size: clamp(5rem, 18vw, 8rem);
    font-weight: bold;
    line-height: 1;
    letter-spacing: 0.05em;
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    user-select: none;
    animation: nf-breathe 3s ease-in-out infinite;
}

.nf-divider {
    width: 3rem;
    border-top: 1px dashed var(--color-primary);
}

.nf-title {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text-primary);
}

.nf-desc {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.7;
    color: var(--text-secondary);
}

.nf-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
}

.nf-hint {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    user-select: none;
}

@keyframes nf-float {
    0%,
    100% {
        transform: translate(0, 0);
    }
    50% {
        transform: translate(20px, 24px);
    }
}

@keyframes nf-breathe {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.75;
    }
}

/* 尊重系统减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
    .nf-glow-1,
    .nf-glow-2,
    .nf-code {
        animation: none;
    }
}
</style>

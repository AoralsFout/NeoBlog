<template>
    <div class="container">
        <Navigation />
        <div class="header">
            <div class="fliter" :class="{ 'dark': theme === 'dark' }"></div>
            <div class="wallpapers" ref="wallpapers">
                <!-- 添加两个图片容器用于交叉淡入淡出 -->
                <img class="wallpaper active" src="https://t.alcy.cc/pc/" />
                <img class="wallpaper" />
            </div>
            <div class="header-content">
                <h1>NeoBlog</h1>
            </div>
            <div class="dynamic">
                <canvas ref="waveCanvas"></canvas>
            </div>
        </div>
        <div class="content">
            <div class="layout" :class="`layout-${effectiveLayout}`">
                <div class="left">
                    <Card class="card">
                        <template v-slot:header>
                            <div>关于我</div>
                        </template>
                        <template v-slot:body>
                            <div class="card-body"></div>
                        </template>
                    </Card>
                    <Card v-if="showRightInLeft">
                        <template #header>右侧栏（移至左侧）</template>
                        <template #body>
                            <div class="card-body">
                                <p>右侧内容，例如标签云、最新评论、广告等。</p>
                                <p>选择两栏布局时，此内容会移动到左侧。</p>
                            </div>
                        </template>
                    </Card>
                </div>
                <div class="main">
                    <router-view v-slot="{ Component }">
                        <transition name="fade" mode="out-in">
                            <component :is="Component" />
                        </transition>
                    </router-view>
                    <Footer />
                </div>
                <div class="right" v-if="showRight">
                    <Card>
                        <template #header>右侧卡片1</template>
                        <template #body>
                            <div class="card-body">
                                <p>Ciallo～(∠・ω< )⌒★</p>
                            </div>
                        </template>
                    </Card>
                    <Card>
                        <template #header>右侧卡片2</template>
                        <template #body>
                            <div class="card-body">
                                <p>Ciallo～(∠・ω< )⌒★</p>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Navigation from '@/components/Navigation.vue';
import Card from '@/components/Card.vue';
import { useThemeStore } from '@/stores/theme';
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import Footer from '@/components/Footer.vue';
import { useLayoutStore } from '@/stores/layout';
import { useBackgroundAnimation } from '@/composables/useBackgroundAnimation';
import { useWaveAnimation } from '@/composables/useWaveAnimation';

const themeStore = useThemeStore();
const layoutStore = useLayoutStore();

const theme = computed(() => themeStore.theme);
const layout = computed(() => layoutStore.layout);

const windowWidth = ref(window.innerWidth);


// 有效布局：小屏幕强制两栏，手机强制单栏（通过CSS处理）
const effectiveLayout = computed(() => {
    if (windowWidth.value <= 768) {
        // 手机屏幕，CSS会强制单栏，但布局值保持用户选择（不影响）
        return layout.value;
    }
    if (windowWidth.value <= 1024) {
        // 小屏幕强制两栏
        return '2';
    }
    return layout.value;
});

// 是否显示右侧栏（三栏或手机屏幕）
const showRight = computed(() => effectiveLayout.value === '3' || windowWidth.value <= 768);

// 是否在左侧显示右侧内容（两栏且非手机屏幕）
const showRightInLeft = computed(() => effectiveLayout.value === '2' && windowWidth.value > 768);

// 使用组合式函数实现背景动画和波浪动画
const wallpapers = ref<HTMLDivElement | null>(null)
const waveCanvas = ref<HTMLCanvasElement | null>(null)
const { start: startBackgroundAnimation, stop: stopBackgroundAnimation } = useBackgroundAnimation(wallpapers)
const { start: startWaveAnimation, stop: stopWaveAnimation } = useWaveAnimation(waveCanvas)

onMounted(() => {
    startBackgroundAnimation()
    startWaveAnimation()
})

onBeforeUnmount(() => {
    stopBackgroundAnimation()
    stopWaveAnimation()
})
</script>

<style scoped>
/* router-view 过渡动画 */
.fade-enter-active,
.fade-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(10px);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.container {
    display: block;
    position: relative;
    width: 100vw;
    min-height: 100vh;
}

.header {
    width: 100%;
    height: 60vh;
    background-color: var(--color-primary);
    position: relative;
    z-index: 0;
    overflow: hidden;

    transition: background-color 0.3s ease-in-out;
}

.dynamic {
    position: absolute;
    width: 100%;
    height: 100px;
    bottom: 0;
    z-index: 4;
}

.dynamic canvas {
    width: 100%;
    height: 100%;
    display: block;
}

.fliter {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 3;
    /* 背景模糊效果 */
    backdrop-filter: blur(30px);
    /* 径向渐变遮罩实现光圈效果 - 中心清晰，边缘模糊 */
    -webkit-mask-image: radial-gradient(circle at center,
            transparent 10%,
            /* 中心30%区域完全透明（不模糊） */
            black 80%
            /* 从30%到70%过渡到完全模糊 */
        );
    mask-image: radial-gradient(circle at center,
            transparent 10%,
            black 80%);

    &.dark {
        background-color: rgba(0, 0, 0, 0.6);
    }
}

/* 壁纸 */
.wallpapers {
    position: relative;
    object-fit: cover;
    width: 100%;
    height: 100%;
    transition: transform 0.5s ease-out;
    overflow: hidden;
    scale: 1.1;
}

.wallpaper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    object-fit: cover;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 1.5s ease-in-out;
    z-index: 0;
    background-repeat: repeat;
}

.wallpaper.active {
    opacity: 1;
    will-change: transform, opacity;
}

.header-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
    z-index: 1;
}

.header-content h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.content {
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 2rem;
    box-sizing: border-box;
}

.layout {
    display: grid;
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

/* 三栏布局 */
.layout-3 {
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-areas: "left main right";
}

/* 两栏布局 */
.layout-2 {
    grid-template-columns: 1fr 3fr;
    grid-template-areas: "left main";
}

.layout-2 .right {
    display: none;
}

/* 手机屏幕单栏 */
@media (max-width: 768px) {
    .layout {
        grid-template-columns: 1fr;
        grid-template-areas: "main" "left" "right";
    }

    .layout .right {
        display: block;
    }

    /* 覆盖两栏和三栏 */
    .layout-2,
    .layout-3 {
        grid-template-columns: 1fr;
        grid-template-areas: "main" "left" "right";
    }

    .layout-2 .right,
    .layout-3 .right {
        display: flex;
    }
}

.left {
    grid-area: left;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.main {
    grid-area: main;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.right {
    grid-area: right;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.card {
    width: 100%;
}

.card-body {
    padding: 10px;
}
</style>
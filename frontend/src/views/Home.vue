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
                            <div>主题</div>
                        </template>
                        <template v-slot:body>
                            <div class="card-body">
                                <Button @click="changeTheme('blue')" size="sm" type="primary">蓝</Button>
                                <Button @click="changeTheme('pink')" size="sm" type="primary">粉</Button>
                                <Button @click="changeTheme('red')" size="sm" type="primary">红</Button>
                                <Button @click="changeTheme('green')" size="sm" type="primary">绿</Button>
                                <Button @click="changeTheme('dark')" size="sm" type="primary">黑</Button>
                            </div>
                        </template>
                    </Card>
                    <Card class="card">
                        <template v-slot:header>
                            <div>圆角</div>
                        </template>
                        <template v-slot:body>
                            <div class="card-body">
                                <Button @click="changeRadius('small')" size="sm" type="outline"
                                    style="border-radius: 4px;">小</Button>
                                <Button @click="changeRadius('medium')" size="sm" type="outline"
                                    style="border-radius: 8px;">中</Button>
                                <Button @click="changeRadius('large')" size="sm" type="outline"
                                    style="border-radius: 12px;">大</Button>
                            </div>
                        </template>
                    </Card>
                    <Card class="card">
                        <template v-slot:header>
                            <div>布局</div>
                        </template>
                        <template v-slot:body>
                            <div class="card-body">
                                <Button :type="layout === '3' ? 'primary' : 'outline'" size="sm"
                                    @click="layout = '3'">三栏</Button>
                                <Button :type="layout === '2' ? 'primary' : 'outline'" size="sm"
                                    @click="layout = '2'">两栏</Button>
                            </div>
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
                    <Card>
                        <template #header>路由内容区</template>
                        <template #body>
                            <div class="card-body">
                                <p>路由内容。</p>
                                <p>路由内容。</p>
                                <p>路由内容。</p>
                                <p>路由内容。</p>
                                <p>路由内容。</p>
                                <p>路由内容。</p>
                                <p>路由内容。</p>
                                <p>路由内容。</p>
                                <p>路由内容。</p>
                            </div>
                        </template>
                    </Card>
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
import Button from '@/components/Button.vue';
import { ref, onMounted, onUnmounted, computed, onBeforeUnmount, watch } from 'vue';
import { useRadiusStore } from '@/stores/radius';
import Footer from '@/components/Footer.vue';

const themeStore = useThemeStore();
const radiusStore = useRadiusStore();
const changeTheme = (theme: string) => {
    console.log('changeTheme called:', theme);
    themeStore.setTheme(theme);
}
const changeRadius = (radius: string) => {
    radiusStore.setRadius(radius);
}

const theme = computed(() => themeStore.theme);

const layout = ref('3');
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

const wallpapers = ref<HTMLDivElement | null>(null)
const waveCanvas = ref<HTMLCanvasElement | null>(null)
// 壁纸切换器
const images = ref<HTMLImageElement[]>([])
const activeIndex = ref(0)
const nextIndex = ref(1)
let intervalId: number | undefined = undefined;

const initWallpaperSwitcher = () => {
    if (wallpapers.value) {
        images.value = Array.from(wallpapers.value.querySelectorAll('img'))
    }

    // 设置初始图片
    if (images.value[activeIndex.value]) {
        images.value[activeIndex.value]!.classList.add('active')
    }

    // 每15秒切换一次（可根据需要调整）
    intervalId = setInterval(switchWallpaper, 15000);
}

const switchWallpaper = () => {
    // 预加载下一张图片
    preloadNextImage().then(() => {
        // 淡出当前图片
        if (images.value[activeIndex.value]) {
            images.value[activeIndex.value]!.classList.remove('active')
        }

        // 淡入新图片
        // setTimeout(() => {
        if (images.value[nextIndex.value]) {
            images.value[nextIndex.value]!.classList.add('active')
        }

        // 更新索引
        [activeIndex.value, nextIndex.value] = [nextIndex.value, activeIndex.value]
        // }, 100)
    })
}

const preloadNextImage = () => {
    return new Promise<void>((resolve) => {
        // 生成带时间戳的新URL避免缓存
        const newUrl = `https://t.alcy.cc/pc/?t=${Date.now()}`
        const img = new Image()

        img.onload = () => {
            if (images.value[nextIndex.value]) {
                images.value[nextIndex.value]!.src = newUrl
            }
            resolve()
        }

        img.onerror = () => {
            // 失败时重试
            setTimeout(() => preloadNextImage(), 1000)
        }

        img.src = newUrl
    })
}

// 波浪动画
let waveCtx: CanvasRenderingContext2D | null = null
let waveTime = 0
let secondaryWaveTime = 0
const waveAmplitude = 20
const waveFrequency = 0.005
const waveSpeed = 0.05
const secondaryWaveAmplitude = 40 // 后方波浪振幅
const secondaryWaveFrequency = 0.005 // 后方波浪频率
const secondaryWaveSpeed = 0.03 // 后方波浪速度
const secondaryWavePhase = Math.PI / 2 // 初始相位差90度

const initWaveCanvas = () => {
    if (!waveCanvas.value) return
    waveCtx = waveCanvas.value.getContext('2d')
    resizeWaveCanvas()
    window.addEventListener('resize', resizeWaveCanvas)
}

const resizeWaveCanvas = () => {
    if (!waveCanvas.value || !waveCtx) return
    const dpr = window.devicePixelRatio || 1
    const rect = waveCanvas.value.getBoundingClientRect()
    waveCanvas.value.width = rect.width * dpr
    waveCanvas.value.height = rect.height * dpr
    waveCtx.setTransform(1, 0, 0, 1, 0, 0)
    waveCtx.scale(dpr, dpr)
}

const drawWaves = () => {
    if (!waveCanvas.value || !waveCtx) return
    const width = waveCanvas.value.clientWidth
    const height = waveCanvas.value.clientHeight

    // 清除画布
    waveCtx.clearRect(0, 0, width, height)

    // 获取CSS颜色变量
    const rootStyle = getComputedStyle(document.documentElement)
    const bgSecondary = rootStyle.getPropertyValue('--bg-secondary').trim()
    const colorPrimary = rootStyle.getPropertyValue('--color-primary').trim()

    // 绘制后方波浪（--color-primary）
    waveCtx.beginPath()
    waveCtx.moveTo(0, height / 2)
    for (let x = 0; x <= width; x += 1) {
        const y = height / 2 + Math.sin(x * secondaryWaveFrequency + secondaryWaveTime + secondaryWavePhase) * secondaryWaveAmplitude
        waveCtx.lineTo(x, y)
    }
    waveCtx.lineTo(width, height)
    waveCtx.lineTo(0, height)
    waveCtx.closePath()
    waveCtx.fillStyle = colorPrimary || '#333333'
    waveCtx.globalAlpha = 0.8
    waveCtx.fill()
    waveCtx.globalAlpha = 1

    // 绘制主波浪（--bg-secondary）
    waveCtx.beginPath()
    waveCtx.moveTo(0, height / 2)
    for (let x = 0; x <= width; x += 1) {
        const y = height / 2 + Math.sin(x * waveFrequency + waveTime) * waveAmplitude
        waveCtx.lineTo(x, y)
    }
    waveCtx.lineTo(width, height)
    waveCtx.lineTo(0, height)
    waveCtx.closePath()
    waveCtx.fillStyle = bgSecondary || '#f8f9fa'
    waveCtx.fill()

    waveTime += waveSpeed
    secondaryWaveTime += secondaryWaveSpeed
}

// 镜头动画
let angle = 0;
let animationFrameId: number | undefined = undefined;
const animation = () => {
    //镜头摇晃动画
    let speed = 1
    //speed扰动
    speed = speed + Math.cos(angle) * Math.sin(angle)
    const radius = 10
    const position: [number, number] = [radius * Math.cos(angle) * speed, radius * Math.sin(angle) * speed]
    angle += 0.01
    // 壁纸动画
    if (wallpapers.value) {
        wallpapers.value.style.transform = `
            translateX(${position[0] * 1}px)
            translateY(${position[1] * 1}px)
        `
    }

    // 绘制波浪
    drawWaves()

    animationFrameId = requestAnimationFrame(animation)
}

onMounted(() => {
    animation()
    initWallpaperSwitcher()
    initWaveCanvas()
})

onBeforeUnmount(() => {
    if (intervalId) {
        clearInterval(intervalId)
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
    }
    window.removeEventListener('resize', resizeWaveCanvas)
})
</script>

<style scoped>
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
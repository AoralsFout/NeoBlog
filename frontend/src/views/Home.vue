<template>
    <div class="container">
        <Navigation />
        <div class="header">
            <div class="background"></div>
            <div class="header-content">
                <h1>NeoBlog</h1>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRadiusStore } from '@/stores/radius';
import Footer from '@/components/Footer.vue';

const themeStore = useThemeStore();
const radiusStore = useRadiusStore();
const changeTheme = (theme: string) => {
    themeStore.setTheme(theme);
}
const changeRadius = (radius: string) => {
    radiusStore.setRadius(radius);
}

const layout = ref('3');
const windowWidth = ref(window.innerWidth);

const handleResize = () => {
    windowWidth.value = window.innerWidth;
};

onMounted(() => {
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

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
    height: 400px;
    background-color: var(--color-primary);
    position: relative;

    transition: background-color 0.3s ease-in-out;
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
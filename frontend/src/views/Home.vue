<template>
    <div class="container">
        <Navigation />
        <MusicPlayer />
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
                            <div class="card-body about">
                                <div class="avatar">
                                    <img src="https://q1.qlogo.cn/g?b=qq&nk=2168842137&s=640" alt="">
                                </div>
                                <div class="title">AoralsFout</div>
                                <div class="desc">
                                    <p>这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述这是描述</p>
                                </div>
                                <div class="links">
                                    <a class="link" href="https://github.com/AoralsFout" target="_blank">
                                        <svg width="256px" height="250px" viewBox="0 0 256 250" version="1.1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
                                            <g>
                                                <path
                                                    d="M128.00106,0 C57.3172926,0 0,57.3066942 0,128.00106 C0,184.555281 36.6761997,232.535542 87.534937,249.460899 C93.9320223,250.645779 96.280588,246.684165 96.280588,243.303333 C96.280588,240.251045 96.1618878,230.167899 96.106777,219.472176 C60.4967585,227.215235 52.9826207,204.369712 52.9826207,204.369712 C47.1599584,189.574598 38.770408,185.640538 38.770408,185.640538 C27.1568785,177.696113 39.6458206,177.859325 39.6458206,177.859325 C52.4993419,178.762293 59.267365,191.04987 59.267365,191.04987 C70.6837675,210.618423 89.2115753,204.961093 96.5158685,201.690482 C97.6647155,193.417512 100.981959,187.77078 104.642583,184.574357 C76.211799,181.33766 46.324819,170.362144 46.324819,121.315702 C46.324819,107.340889 51.3250588,95.9223682 59.5132437,86.9583937 C58.1842268,83.7344152 53.8029229,70.715562 60.7532354,53.0843636 C60.7532354,53.0843636 71.5019501,49.6441813 95.9626412,66.2049595 C106.172967,63.368876 117.123047,61.9465949 128.00106,61.8978432 C138.879073,61.9465949 149.837632,63.368876 160.067033,66.2049595 C184.49805,49.6441813 195.231926,53.0843636 195.231926,53.0843636 C202.199197,70.715562 197.815773,83.7344152 196.486756,86.9583937 C204.694018,95.9223682 209.660343,107.340889 209.660343,121.315702 C209.660343,170.478725 179.716133,181.303747 151.213281,184.472614 C155.80443,188.444828 159.895342,196.234518 159.895342,208.176593 C159.895342,225.303317 159.746968,239.087361 159.746968,243.303333 C159.746968,246.709601 162.05102,250.70089 168.53925,249.443941 C219.370432,232.499507 256,184.536204 256,128.00106 C256,57.3066942 198.691187,0 128.00106,0 Z M47.9405593,182.340212 C47.6586465,182.976105 46.6581745,183.166873 45.7467277,182.730227 C44.8183235,182.312656 44.2968914,181.445722 44.5978808,180.80771 C44.8734344,180.152739 45.876026,179.97045 46.8023103,180.409216 C47.7328342,180.826786 48.2627451,181.702199 47.9405593,182.340212 Z M54.2367892,187.958254 C53.6263318,188.524199 52.4329723,188.261363 51.6232682,187.366874 C50.7860088,186.474504 50.6291553,185.281144 51.2480912,184.70672 C51.8776254,184.140775 53.0349512,184.405731 53.8743302,185.298101 C54.7115892,186.201069 54.8748019,187.38595 54.2367892,187.958254 Z M58.5562413,195.146347 C57.7719732,195.691096 56.4895886,195.180261 55.6968417,194.042013 C54.9125733,192.903764 54.9125733,191.538713 55.713799,190.991845 C56.5086651,190.444977 57.7719732,190.936735 58.5753181,192.066505 C59.3574669,193.22383 59.3574669,194.58888 58.5562413,195.146347 Z M65.8613592,203.471174 C65.1597571,204.244846 63.6654083,204.03712 62.5716717,202.981538 C61.4524999,201.94927 61.1409122,200.484596 61.8446341,199.710926 C62.5547146,198.935137 64.0575422,199.15346 65.1597571,200.200564 C66.2704506,201.230712 66.6095936,202.705984 65.8613592,203.471174 Z M75.3025151,206.281542 C74.9930474,207.284134 73.553809,207.739857 72.1039724,207.313809 C70.6562556,206.875043 69.7087748,205.700761 70.0012857,204.687571 C70.302275,203.678621 71.7478721,203.20382 73.2083069,203.659543 C74.6539041,204.09619 75.6035048,205.261994 75.3025151,206.281542 Z M86.046947,207.473627 C86.0829806,208.529209 84.8535871,209.404622 83.3316829,209.4237 C81.8013,209.457614 80.563428,208.603398 80.5464708,207.564772 C80.5464708,206.498591 81.7483088,205.631657 83.2786917,205.606221 C84.8005962,205.576546 86.046947,206.424403 86.046947,207.473627 Z M96.6021471,207.069023 C96.7844366,208.099171 95.7267341,209.156872 94.215428,209.438785 C92.7295577,209.710099 91.3539086,209.074206 91.1652603,208.052538 C90.9808515,206.996955 92.0576306,205.939253 93.5413813,205.66582 C95.054807,205.402984 96.4092596,206.021919 96.6021471,207.069023 Z">
                                                </path>
                                            </g>
                                        </svg>
                                        <div class="text">
                                            <span>Github</span>
                                        </div>
                                    </a>
                                    <a class="link" href="https://space.bilibili.com/345054137" target="_blank">
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" clip-rule="evenodd"
                                                d="M3.73252 2.67094C3.33229 2.28484 3.33229 1.64373 3.73252 1.25764C4.11291 0.890684 4.71552 0.890684 5.09591 1.25764L7.21723 3.30403C7.27749 3.36218 7.32869 3.4261 7.37081 3.49407H10.5789C10.6211 3.4261 10.6723 3.36218 10.7325 3.30403L12.8538 1.25764C13.2342 0.890684 13.8368 0.890684 14.2172 1.25764C14.6175 1.64373 14.6175 2.28484 14.2172 2.67094L13.364 3.49407H14C16.2091 3.49407 18 5.28493 18 7.49407V12.9996C18 15.2087 16.2091 16.9996 14 16.9996H4C1.79086 16.9996 0 15.2087 0 12.9996V7.49406C0 5.28492 1.79086 3.49407 4 3.49407H4.58579L3.73252 2.67094ZM4 5.42343C2.89543 5.42343 2 6.31886 2 7.42343V13.0702C2 14.1748 2.89543 15.0702 4 15.0702H14C15.1046 15.0702 16 14.1748 16 13.0702V7.42343C16 6.31886 15.1046 5.42343 14 5.42343H4ZM5 9.31747C5 8.76519 5.44772 8.31747 6 8.31747C6.55228 8.31747 7 8.76519 7 9.31747V10.2115C7 10.7638 6.55228 11.2115 6 11.2115C5.44772 11.2115 5 10.7638 5 10.2115V9.31747ZM12 8.31747C11.4477 8.31747 11 8.76519 11 9.31747V10.2115C11 10.7638 11.4477 11.2115 12 11.2115C12.5523 11.2115 13 10.7638 13 10.2115V9.31747C13 8.76519 12.5523 8.31747 12 8.31747Z">
                                            </path>
                                        </svg>
                                        <div class="text">
                                            <span>bilibili</span>
                                        </div>
                                    </a>
                                    <a class="link" href="https://steamcommunity.com/profiles/76561199198280801/"
                                        target="_blank">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34"
                                            viewBox="0 0 34 34">
                                            <path
                                                d="M16.832 0C7.95936 0 0.690707 6.8414 0 15.5358L9.05289 19.2787C9.81996 18.7541 10.7466 18.4467 11.7436 18.4467C11.8329 18.4467 11.9219 18.4498 12.0101 18.4548L16.0359 12.6194C16.0359 12.5916 16.0356 12.5645 16.0356 12.537C16.0356 9.02463 18.8927 6.16711 22.4054 6.16711C25.9178 6.16711 28.7749 9.02463 28.7749 12.537C28.7749 16.0493 25.9178 18.9072 22.4054 18.9072C22.3569 18.9072 22.3088 18.9061 22.2607 18.9049L16.5189 23.0018C16.522 23.0763 16.5247 23.1523 16.5247 23.2278C16.5247 25.8647 14.38 28.009 11.7436 28.009C9.42936 28.009 7.49431 26.3572 7.05598 24.1698L0.581889 21.4933C2.58643 28.5828 9.09985 33.7805 16.832 33.7805C26.1606 33.7805 33.7225 26.2182 33.7225 16.8908C33.7225 7.56189 26.1602 0 16.832 0Z">
                                            </path>
                                            <path
                                                d="M10.5846 25.6287L8.50977 24.7715C8.87746 25.537 9.51356 26.1781 10.3581 26.5301C12.184 27.2907 14.2889 26.4244 15.0499 24.597C15.4184 23.7135 15.4207 22.7379 15.0553 21.8521C14.6906 20.9659 14.0026 20.2748 13.1179 19.906C12.2401 19.5406 11.2997 19.5539 10.4735 19.8659L12.6166 20.7521C13.9633 21.3134 14.6001 22.8597 14.0389 24.2064C13.4787 25.5534 11.9312 26.1903 10.5846 25.6287Z">
                                            </path>
                                            <path
                                                d="M26.6497 12.5368C26.6497 10.1966 24.746 8.29248 22.4054 8.29248C20.0653 8.29248 18.1611 10.1966 18.1611 12.5368C18.1611 14.8773 20.0653 16.7807 22.4054 16.7807C24.746 16.7803 26.6497 14.8769 26.6497 12.5368ZM19.2241 12.5295C19.2241 10.7686 20.6517 9.34133 22.4127 9.34133C24.1736 9.34133 25.6012 10.7686 25.6012 12.5295C25.6012 14.2904 24.1736 15.7177 22.4127 15.7177C20.6517 15.7177 19.2241 14.2901 19.2241 12.5295Z">
                                            </path>
                                            <path
                                                d="M59.9854 10.1185L58.4527 12.8127C57.2721 11.9879 55.6722 11.4915 54.2754 11.4915C52.6791 11.4915 51.6914 12.1523 51.6914 13.336C51.6914 14.7741 53.446 15.1087 56.0538 16.0447C58.8571 17.036 60.4684 18.201 60.4684 20.7685C60.4684 24.2813 57.706 26.2541 53.7356 26.2541C51.8005 26.2541 49.4663 25.7545 47.6719 24.6629L48.7899 21.6761C50.2476 22.446 51.9913 22.9027 53.5458 22.9027C55.6411 22.9027 56.6371 22.1296 56.6371 20.9867C56.6371 19.679 55.1183 19.286 52.6667 18.4741C49.8727 17.5412 47.9366 16.3172 47.9366 13.4756C47.9366 10.2711 50.5031 8.43066 54.1958 8.43066C56.7695 8.43066 58.838 9.24616 59.9854 10.1185Z">
                                            </path>
                                        </svg>
                                        <div class="text">
                                            <span>Steam</span>
                                        </div>
                                    </a>
                                    <a class="link unreachabel">
                                        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z">
                                            </path>
                                        </svg>
                                        <div class="text">
                                            <span>2168842137</span>
                                        </div>
                                    </a>
                                    <a class="link unreachabel">
                                        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112 331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3-34 109.5-23 154.8-14.6 155.8 18 2.2 70.1-82.4 70.1-82.4 0 49 25.2 112.9 79.8 159-26.4 8.1-85.7 29.9-71.6 53.8 11.4 19.3 196.2 12.3 249.5 6.3 53.3 6 238.1 13 249.5-6.3 14.1-23.8-45.3-45.7-71.6-53.8 54.6-46.2 79.8-110.1 79.8-159 0 0 52.1 84.6 70.1 82.4 8.5-1.1 19.5-46.4-14.5-155.8z">
                                            </path>
                                        </svg>
                                        <div class="text">
                                            <span>3250658422</span>
                                        </div>
                                    </a>
                                    <a class="link unreachabel">
                                        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M926.47619 355.644952V780.190476a73.142857 73.142857 0 0 1-73.142857 73.142857H170.666667a73.142857 73.142857 0 0 1-73.142857-73.142857V355.644952l304.103619 257.828572a170.666667 170.666667 0 0 0 220.745142 0L926.47619 355.644952zM853.333333 170.666667a74.044952 74.044952 0 0 1 26.087619 4.778666 72.704 72.704 0 0 1 30.622477 22.186667 73.508571 73.508571 0 0 1 10.678857 17.67619c3.169524 7.509333 5.12 15.652571 5.607619 24.210286L926.47619 243.809524v24.380952L559.469714 581.241905a73.142857 73.142857 0 0 1-91.306666 2.901333l-3.632762-2.925714L97.52381 268.190476v-24.380952a72.899048 72.899048 0 0 1 40.155428-65.292191A72.97219 72.97219 0 0 1 170.666667 170.666667h682.666666z">
                                            </path>
                                        </svg>
                                        <div class="text">
                                            <span>sfout@qq.com</span>
                                        </div>
                                    </a>
                                    <a class="link unreachabel">
                                        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M512 0C294.208 0 117.034667 177.152 117.056 394.922667c0 80.896 24.298667 158.677333 69.781333 224.149333 2.282667 3.925333 4.586667 7.722667 7.296 11.413333l288.277333 379.989333C490.24 1019.2 500.757333 1024 512.021333 1024c11.114667 0 21.696-4.842667 30.848-15.104l286.954667-378.474667c2.837333-3.754667 5.248-7.872 6.570667-10.282667 46.144-66.389333 70.570667-144.256 70.570667-225.173333C906.965333 177.152 729.792 0 512 0zM512 536.170667c-77.781333 0-141.077333-63.296-141.077333-141.098667 0-77.781333 63.296-141.056 141.077333-141.056 77.781333 0 141.077333 63.296 141.077333 141.056C653.077333 472.874667 589.781333 536.170667 512 536.170667z">
                                            </path>
                                        </svg>
                                        <div class="text">
                                            <span>江苏 无锡</span>
                                        </div>
                                    </a>
                                </div>
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
                    <!-- <MusicBox></MusicBox> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Navigation from '@/components/Navigation.vue';
import Card from '@/components/Card.vue';
import Footer from '@/components/Footer.vue';
import MusicBox from '@/components/MusicBox.vue';
import { useThemeStore } from '@/stores/theme';
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useLayoutStore } from '@/stores/layout';
import { useBackgroundAnimation } from '@/composables/useBackgroundAnimation';
import { useWaveAnimation } from '@/composables/useWaveAnimation';
import MusicPlayer from '@/components/MusicPlayer.vue';

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

    transition: background-color 0.2s ease-in-out;
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
    gap: 2rem;
}

.main {
    grid-area: main;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.right {
    grid-area: right;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.card {
    width: 100%;
}

.card-body {
    padding: 1rem;
}

.about {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;

    >.avatar {
        width: 100%;

        >img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: var(--radius-large);

            transition: border-radius 0.2s ease-in-out;
        }
    }

    >.title {
        font-size: 1.5rem;
        font-weight: bold;
    }

    >.desc p {
        font-size: 1rem;
        text-indent: 4ch;
        /* 缩进4个字符 */
    }

    >.links {
        display: flex;
        flex-direction: column;
        gap: 10px;

        >.link {
            user-select: none;
            position: relative;
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--text-secondary);
            text-decoration: none;
            z-index: 1;

            &.unreachabel {
                color: var(--text-secondary);

                >svg:hover {
                    color: var(--text-secondary);
                }

                &:hover {
                    color: var(--text-primary);
                }

                >.text::after {
                    display: none;
                }
            }

            >svg {
                width: 1rem;
                height: 1rem;
                fill: currentColor;
                transition: color 0.2s ease-in-out;
                -webkit-user-drag: none;

                &:hover {
                    color: var(--text-primary);
                }
            }

            >.text {
                position: relative;

                >span {
                    position: relative;
                    z-index: 1;
                    font-size: 0.8rem;
                    line-height: 0.8rem;
                    height: 0.8rem;
                    text-shadow: 0 0 10px rgba(0, 0, 0, 0.0);

                    transition: text-shadow 0.2s ease-in-out, color 0.2s ease-in-out;

                    &:hover {
                        text-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        color: var(--text-primary);
                    }
                }

                &::after {
                    z-index: 0;
                    content: '';
                    display: block;
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    height: 1px;
                    width: 0%;
                    background-color: var(--color-primary);

                    transition: width 0.2s ease-in-out;
                }

                &:hover::after {
                    width: 100%;
                }
            }
        }
    }
}
</style>
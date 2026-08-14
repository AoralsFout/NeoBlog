<template>
    <Card>
        <template #body>
            <div class="card-body">
                <div class="time-scenery">
                    <svg class="scenery-svg" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                        <defs>
                            <linearGradient :id="skyId" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" :stop-color="scene.sky[0]" />
                                <stop offset="100%" :stop-color="scene.sky[1]" />
                            </linearGradient>
                            <radialGradient :id="glowId">
                                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
                                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
                            </radialGradient>
                            <linearGradient :id="shadeId" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#000000" stop-opacity="0" />
                                <stop offset="100%" stop-color="#000000" stop-opacity="0.22" />
                            </linearGradient>
                            <mask :id="moonMaskId">
                                <circle cx="330" cy="32" r="14" fill="#ffffff" />
                                <circle cx="337" cy="26" r="13" fill="#000000" />
                            </mask>
                        </defs>

                        <!-- 天空 -->
                        <rect class="sky" width="400" height="160" :fill="`url(#${skyId})`" />

                        <!-- 星星（深夜/凌晨/傍晚） -->
                        <g v-if="scene.stars > 0" :opacity="scene.stars">
                            <circle v-for="(s, i) in stars" :key="i" :cx="s.x" :cy="s.y" :r="s.r" fill="#ffffff" />
                        </g>

                        <!-- 太阳与光晕 -->
                        <template v-if="scene.sun">
                            <circle :cx="scene.sun.x" :cy="scene.sun.y" r="36" :fill="`url(#${glowId})`" />
                            <circle :cx="scene.sun.x" :cy="scene.sun.y" r="15" :fill="scene.sun.color" />
                        </template>

                        <!-- 月亮（深夜） -->
                        <template v-if="scene.moon">
                            <circle cx="330" cy="32" r="22" fill="#ffffff" opacity="0.10" />
                            <circle cx="330" cy="32" r="14" fill="#f7f3e3" :mask="`url(#${moonMaskId})`" />
                        </template>

                        <!-- 云朵 -->
                        <g v-if="scene.clouds > 0" :opacity="scene.clouds" fill="#ffffff">
                            <g opacity="0.92">
                                <ellipse cx="118" cy="40" rx="26" ry="9" />
                                <ellipse cx="140" cy="36" rx="18" ry="8" />
                                <ellipse cx="292" cy="54" rx="30" ry="10" />
                                <ellipse cx="316" cy="50" rx="20" ry="9" />
                            </g>
                        </g>

                        <!-- 远山 -->
                        <path class="hill hill-back" d="M0,160 L0,118 Q55,90 118,110 T236,100 T352,112 T400,102 L400,160 Z"
                            :fill="scene.hillBack" opacity="0.85" />
                        <!-- 近山 -->
                        <path class="hill hill-top" d="M0,160 L0,136 Q80,112 172,136 T312,126 T400,132 L400,160 Z"
                            :fill="scene.hillTop" />

                        <!-- 飞鸟 -->
                        <g v-if="scene.birds" stroke="#3b4654" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.65">
                            <path d="M146,42 q6,-7 12,0 q6,-7 12,0" />
                            <path d="M198,30 q5,-6 10,0 q5,-6 10,0" />
                        </g>

                        <!-- 底部渐变保证文字可读性 -->
                        <rect width="400" height="64" y="96" :fill="`url(#${shadeId})`" />
                    </svg>
                    <div class="time-overlay">
                        <div class="time-container">{{ time }}</div>
                        <div class="time-tips">{{ timeTips }}</div>
                    </div>
                </div>
            </div>
        </template>
    </Card>
    <!-- 站点统计 -->
    <Card>
        <template #header>站点统计</template>
        <template #body>
            <div class="card-body">
                <div v-if="statsLoading" class="stats-loading">加载中...</div>
                <div v-else-if="stats" class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value">{{ formatNumber(stats.articles) }}</span>
                        <span class="stat-label">文章</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">{{ formatNumber(stats.views) }}</span>
                        <span class="stat-label">浏览</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">{{ formatNumber(stats.comments) }}</span>
                        <span class="stat-label">评论</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">{{ blogDays ?? '--' }}</span>
                        <span class="stat-label">运行天数</span>
                    </div>
                </div>
            </div>
        </template>
    </Card>
    <!-- 标签云 -->
    <Card v-if="tags.length > 0">
        <template #header>标签</template>
        <template #body>
            <div class="card-body">
                <div class="tag-cloud">
                    <button v-for="t in tags" :key="t.name" class="tag-chip"
                        :class="{ active: activeTag === t.name }" :style="{ fontSize: tagFontSize(t.count) }"
                        @click="goTag(t.name)">
                        {{ t.name }}
                    </button>
                </div>
            </div>
        </template>
    </Card>
    <!-- 导航 -->
    <Card>
        <template #header>导航</template>
        <template #body>
            <div class="card-body">
                <div class="nav-links">
                    <a v-for="link in navLinks" :key="link.url" class="nav-link" :href="link.url" target="_blank"
                        rel="noopener noreferrer">
                        <span class="nav-link-name">{{ link.name }}</span>
                        <span class="nav-link-domain">{{ link.domain }}</span>
                        <svg class="nav-link-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </a>
                </div>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import Card from '@/components/Card.vue';
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { statsApi } from '@/utils/api';

// ===== 站点统计与标签云 =====
interface SiteStats {
    articles: number;
    views: number;
    comments: number;
    first_article_at: string | null;
}

const router = useRouter();
const route = useRoute();

const stats = ref<SiteStats | null>(null);
const statsLoading = ref(true);
const tags = ref<{ name: string; count: number }[]>([]);

const activeTag = computed(() => {
    const q = route.query.tag;
    return typeof q === 'string' ? q : '';
});

// 博客运行天数（自首篇文章起算）
const blogDays = computed(() => {
    if (!stats.value?.first_article_at) return null;
    const first = new Date(stats.value.first_article_at).getTime();
    const now = Date.now();
    if (isNaN(first) || first > now) return null;
    return Math.floor((now - first) / 86400000) + 1;
});

const formatNumber = (n: number) => n.toLocaleString('zh-CN');

// 标签字号按出现次数缩放
const tagFontSize = (count: number) => {
    return `${Math.min(1.1, 0.75 + count * 0.08)}rem`;
};

const goTag = (name: string) => {
    router.push({ path: '/articles', query: { tag: name } });
};

// 导航卡片外链
const navLinks = [
    { name: '关于我', url: 'https://about.aoralsfout.top/', domain: 'about.aoralsfout.top' },
    { name: 'Kisaki', url: 'https://kisaki.aoralsfout.top/', domain: 'kisaki.aoralsfout.top' },
    { name: '音乐精选', url: 'https://radio.aoralsfout.top/', domain: 'radio.aoralsfout.top' },
];

const loadSidebarData = async () => {
    try {
        const [statsRes, tagsRes] = await Promise.all([
            statsApi.getSiteStats(),
            statsApi.getTags(),
        ]);
        if (statsRes.success) {
            stats.value = statsRes.data;
        }
        if (tagsRes.success && Array.isArray(tagsRes.data)) {
            tags.value = tagsRes.data;
        }
    } catch (err) {
        console.error('加载侧栏数据失败:', err);
    } finally {
        statsLoading.value = false;
    }
};

// ===== 时间段与风景配置 =====
type Period = 'deep-night' | 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'midnight';

interface Scene {
    sky: [string, string];
    sun?: { x: number; y: number; color: string };
    moon?: boolean;
    stars: number;
    hillBack: string;
    hillTop: string;
    clouds: number;
    birds: boolean;
}

const SCENES: Record<Period, Scene> = {
    // 0-5点：凌晨，明月高照
    'deep-night': {
        sky: ['#0a1730', '#20365f'],
        moon: true,
        stars: 0.9,
        hillBack: '#12294d',
        hillTop: '#081528',
        clouds: 0,
        birds: false,
    },
    // 5-9点：清晨，日出
    dawn: {
        sky: ['#3d3563', '#f5a884'],
        sun: { x: 118, y: 108, color: '#ffd9a3' },
        stars: 0.25,
        hillBack: '#4a3b66',
        hillTop: '#2c2347',
        clouds: 0.25,
        birds: true,
    },
    // 9-12点：上午，清朗
    morning: {
        sky: ['#6fb8ef', '#d6f1fd'],
        sun: { x: 86, y: 60, color: '#ffe08c' },
        stars: 0,
        hillBack: '#a9d9a0',
        hillTop: '#6fae63',
        clouds: 0.55,
        birds: true,
    },
    // 12-14点：正午，艳阳
    noon: {
        sky: ['#3f9be0', '#c8ecff'],
        sun: { x: 200, y: 30, color: '#ffd75e' },
        stars: 0,
        hillBack: '#8fc984',
        hillTop: '#57a04f',
        clouds: 0.4,
        birds: false,
    },
    // 14-18点：下午，暖阳西斜
    afternoon: {
        sky: ['#5faee6', '#f9ecd0'],
        sun: { x: 308, y: 66, color: '#ffc25e' },
        stars: 0,
        hillBack: '#93c98a',
        hillTop: '#63a259',
        clouds: 0.45,
        birds: true,
    },
    // 18-22点：傍晚，日落
    dusk: {
        sky: ['#41306a', '#f28d5f'],
        sun: { x: 284, y: 110, color: '#ff9e5e' },
        stars: 0.3,
        hillBack: '#563f6e',
        hillTop: '#2f2146',
        clouds: 0.2,
        birds: true,
    },
    // 22-24点：深夜，繁星
    midnight: {
        sky: ['#040b1e', '#132747'],
        moon: true,
        stars: 1,
        hillBack: '#0e1f3e',
        hillTop: '#060f22',
        clouds: 0,
        birds: false,
    },
};

const getPeriod = (hour: number): Period => {
    if (hour < 5) return 'deep-night';
    if (hour < 9) return 'dawn';
    if (hour < 12) return 'morning';
    if (hour < 14) return 'noon';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'dusk';
    return 'midnight';
};

// 每实例唯一的渐变/遮罩ID，避免多实例时SVG ID冲突
const uid = Math.random().toString(36).slice(2, 8);
const skyId = `sky-${uid}`;
const glowId = `glow-${uid}`;
const shadeId = `shade-${uid}`;
const moonMaskId = `moon-mask-${uid}`;

// 固定的星星坐标
const stars = [
    { x: 18, y: 18, r: 1.1 }, { x: 46, y: 44, r: 0.9 }, { x: 74, y: 12, r: 1.3 },
    { x: 98, y: 60, r: 0.8 }, { x: 128, y: 24, r: 1.0 }, { x: 156, y: 52, r: 0.7 },
    { x: 184, y: 14, r: 1.2 }, { x: 210, y: 66, r: 0.8 }, { x: 240, y: 26, r: 1.0 },
    { x: 266, y: 58, r: 0.7 }, { x: 294, y: 16, r: 1.2 }, { x: 320, y: 62, r: 0.9 },
    { x: 348, y: 28, r: 1.0 }, { x: 374, y: 50, r: 0.8 }, { x: 60, y: 80, r: 0.7 },
    { x: 132, y: 86, r: 0.6 }, { x: 250, y: 82, r: 0.7 }, { x: 362, y: 78, r: 0.6 },
    { x: 30, y: 66, r: 0.6 }, { x: 204, y: 40, r: 0.6 },
];

const time = ref<string>("--:--:--");
const timeTips = ref<string>("加载中");
const period = ref<Period>(getPeriod(new Date().getHours()));
const scene = computed(() => SCENES[period.value]);
const timer = ref<number | null>(null);
const lastDate = ref<Date>(new Date());

if (lastDate.value.getHours() >= 0 && lastDate.value.getHours() < 5) {
    timeTips.value = "明月高照，你的心里正在想什么呢？";
} else if (lastDate.value.getHours() >= 5 && lastDate.value.getHours() < 9) {
    timeTips.value = "早上好呀！新的一天开始啦，记得吃早餐哦～(≧∇≦)ﾉ";
} else if (lastDate.value.getHours() >= 9 && lastDate.value.getHours() < 12) {
    timeTips.value = "上午好！工作/学习加油鸭，保持元气满满！";
} else if (lastDate.value.getHours() >= 12 && lastDate.value.getHours() < 14) {
    timeTips.value = "中午好！吃饱饱才能有力气下午继续冲呀～";
} else if (lastDate.value.getHours() >= 14 && lastDate.value.getHours() < 18) {
    timeTips.value = "下午好！喝杯茶提提神，效率加倍哦～";
} else if (lastDate.value.getHours() >= 18 && lastDate.value.getHours() < 22) {
    timeTips.value = "今天就要结束了！辛苦了一天，好好放松一下吧～";
} else if (lastDate.value.getHours() >= 22) {
    timeTips.value = "夜深啦，早点休息哦，好梦～";
}

const updateTime = () => {
    const date = new Date();
    // 更新时间
    time.value = `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
    // 更新风景时段（真实时间）
    period.value = getPeriod(date.getHours());

    // 更新提示
    const cur = date.getHours();
    const prev = lastDate.value.getHours();
    if (cur >= 0 && cur < 5 && prev >= 5) {
        timeTips.value = "明月高照，你的心里正在想什么呢？";
        lastDate.value = date;
    } else if (cur >= 5 && cur < 9 && (prev < 5 || prev >= 9)) {
        timeTips.value = "早上好呀！新的一天开始啦，记得吃早餐哦～(≧∇≦)ﾉ";
        lastDate.value = date;
    } else if (cur >= 9 && cur < 12 && (prev < 9 || prev >= 12)) {
        timeTips.value = "上午好！工作/学习加油鸭，保持元气满满！";
        lastDate.value = date;
    } else if (cur >= 12 && cur < 14 && (prev < 12 || prev >= 14)) {
        timeTips.value = "中午好！吃饱饱才能有力气下午继续冲呀～";
        lastDate.value = date;
    } else if (cur >= 14 && cur < 18 && (prev < 14 || prev >= 18)) {
        timeTips.value = "下午好！喝杯茶提提神，效率加倍哦～";
        lastDate.value = date;
    } else if (cur >= 18 && cur < 22 && (prev < 18 || prev >= 22)) {
        timeTips.value = "今天就要结束了！辛苦了一天，好好放松一下吧～";
        lastDate.value = date;
    } else if (cur >= 22 && prev < 22) {
        timeTips.value = "夜深啦，早点休息哦，好梦～";
        lastDate.value = date;
    }
};

const padZero = (num: number) => {
    return num < 10 ? `0${num}` : num;
};

onMounted(() => {
    timer.value = setInterval(updateTime, 1000);
    loadSidebarData();
});

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
    }
});
</script>

<style scoped>
.time-scenery {
    position: relative;
    height: 150px;
    overflow: hidden;
    border-radius: var(--radius-small) var(--radius-small) 0 0;
    transition: border-radius 0.2s ease-in-out;
}

.scenery-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
}

/* 时段切换时天空与山峦颜色平滑过渡 */
.sky,
.hill {
    transition: fill 0.8s ease;
}

.time-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
}

.time-container {
    font-size: 1.6rem;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.4);
    user-select: none;
}

.time-tips {
    padding: 0 0.75rem;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.95);
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
}

/* ===== 站点统计 ===== */
.stats-loading {
    padding: 1rem;
    text-align: center;
    font-size: 0.85rem;
    color: var(--text-tertiary);
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    padding: 0.5rem 0;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
}

.stat-value {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--color-primary);
}

.stat-label {
    font-size: 0.75rem;
    color: var(--text-tertiary);
}

/* ===== 标签云 ===== */
.tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 0.6rem;
    padding: 1rem 0.5rem;
    align-items: center;
}

.tag-chip {
    padding: 0.1rem 0.5rem;
    font-family: inherit;
    color: var(--text-secondary);
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    border: none;
    border-radius: var(--radius-medium);
    cursor: pointer;
    transition: all 0.15s ease;
}

.tag-chip:hover {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 18%, transparent);
}

.tag-chip.active {
    color: var(--text-on-color);
    background: var(--color-primary);
}

/* ===== 导航卡片 ===== */
.nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.25rem 0;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.45rem 0.6rem;
    border-radius: var(--radius-medium);
    text-decoration: none;
    color: var(--text-primary);
    transition: background-color 0.15s ease;
}

.nav-link:hover {
    background-color: var(--bg-secondary);
}

.nav-link-name {
    font-size: 0.9rem;
    font-weight: 500;
}

.nav-link-domain {
    flex: 1;
    font-size: 0.75rem;
    color: var(--text-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.nav-link-arrow {
    width: 14px;
    height: 14px;
    color: var(--text-tertiary);
    flex-shrink: 0;
    transition: color 0.15s ease;
}

.nav-link:hover .nav-link-arrow {
    color: var(--color-primary);
}
</style>

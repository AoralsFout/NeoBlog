<template>
    <section class="settings-panel" aria-labelledby="settings-title">
        <header class="settings-intro">
            <p class="eyebrow">APPEARANCE / 个性化</p>
            <h2 id="settings-title">把阅读空间调成喜欢的样子</h2>
            <p>选择会立即保存。手机端会自动使用单栏，保证内容始终清晰。</p>
        </header>

        <div class="setting-group">
            <div class="group-copy">
                <h3>主题色</h3>
                <p>用于链接、按钮和信息标记。</p>
            </div>
            <div class="theme-options" role="group" aria-label="主题色">
                <button v-for="option in themeOptions" :key="option.value" type="button" class="theme-option"
                    :class="{ selected: theme === option.value }" :aria-pressed="theme === option.value"
                    @click="changeTheme(option.value)">
                    <span class="theme-swatch" :style="{ '--swatch': option.color }"></span>
                    <span>{{ option.label }}</span>
                    <span v-if="theme === option.value" class="selected-mark" aria-hidden="true">✓</span>
                </button>
            </div>
        </div>

        <div class="setting-group">
            <div class="group-copy">
                <h3>圆角</h3>
                <p>控制卡片和按钮的轮廓性格。</p>
            </div>
            <div class="choice-grid radius-options" role="group" aria-label="圆角大小">
                <button v-for="option in radiusOptions" :key="option.value" type="button" class="choice-option"
                    :class="{ selected: radius === option.value }" :aria-pressed="radius === option.value"
                    @click="changeRadius(option.value)">
                    <span class="radius-preview" :style="{ borderRadius: option.preview }"></span>
                    <span>{{ option.label }}</span>
                </button>
            </div>
        </div>

        <div class="setting-group">
            <div class="group-copy">
                <h3>桌面布局</h3>
                <p>两栏更专注，三栏能同时显示更多站点信息。</p>
            </div>
            <div class="choice-grid layout-options" role="group" aria-label="桌面布局">
                <button type="button" class="choice-option" :class="{ selected: layout === '2' }"
                    :aria-pressed="layout === '2'" @click="changeLayout('2')">
                    <span class="layout-preview layout-preview--two"><i></i><i></i></span>
                    <span>两栏 · 专注</span>
                </button>
                <button type="button" class="choice-option" :class="{ selected: layout === '3' }"
                    :aria-pressed="layout === '3'" @click="changeLayout('3')">
                    <span class="layout-preview layout-preview--three"><i></i><i></i><i></i></span>
                    <span>三栏 · 丰富</span>
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { useRadiusStore } from '@/stores/radius';
import { useLayoutStore } from '@/stores/layout';

const themeOptions = [
    { value: 'blue', label: '深海蓝', color: '#0066cc' },
    { value: 'pink', label: '樱桃粉', color: '#eb2f96' },
    { value: 'red', label: '信号红', color: '#cf1322' },
    { value: 'green', label: '薄荷绿', color: '#00a86b' },
    { value: 'dark', label: '夜航黑', color: '#6577a8' },
];

const radiusOptions = [
    { value: 'small', label: '利落', preview: '4px' },
    { value: 'medium', label: '平衡', preview: '10px' },
    { value: 'large', label: '柔和', preview: '18px' },
];

const themeStore = useThemeStore();
const radiusStore = useRadiusStore();
const layoutStore = useLayoutStore();

const theme = computed(() => themeStore.theme);
const radius = computed(() => radiusStore.radius);
const layout = computed(() => layoutStore.layout);

const changeTheme = (value: string) => themeStore.setTheme(value);
const changeRadius = (value: string) => radiusStore.setRadius(value);
const changeLayout = (value: string) => layoutStore.setLayout(value);
</script>

<style scoped>
.settings-panel {
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--border-color) 72%, transparent);
    border-radius: var(--radius-medium);
    background: var(--surface-card);
    box-shadow: var(--shadow-card);
}

.settings-intro {
    padding: clamp(1.4rem, 4vw, 2.5rem);
    border-bottom: 1px solid var(--border-color);
    background:
        radial-gradient(circle at 88% 20%, color-mix(in srgb, var(--color-primary) 20%, transparent), transparent 30%),
        var(--surface-subtle);
}

.eyebrow {
    margin: 0 0 0.65rem;
    color: var(--color-primary);
    font-family: var(--font-display);
    font-size: 0.7rem;
    letter-spacing: 0.14em;
}

.settings-intro h2 {
    margin: 0;
    font-size: clamp(1.45rem, 3vw, 2rem);
    letter-spacing: -0.04em;
}

.settings-intro > p:last-child,
.group-copy p {
    margin: 0.55rem 0 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.setting-group {
    display: grid;
    grid-template-columns: minmax(160px, 0.7fr) minmax(0, 1.6fr);
    gap: 1.5rem;
    padding: 1.5rem clamp(1.2rem, 4vw, 2.5rem);
    border-bottom: 1px solid var(--border-color);
}

.setting-group:last-child {
    border-bottom: 0;
}

.group-copy h3 {
    margin: 0;
    font-size: 1rem;
}

.theme-options,
.choice-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(105px, 1fr));
    gap: 0.65rem;
}

.theme-option,
.choice-option {
    position: relative;
    display: flex;
    min-height: 48px;
    align-items: center;
    gap: 0.65rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-small);
    background: var(--bg-primary);
    color: var(--text-primary);
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.theme-option {
    padding-right: 2rem;
    white-space: nowrap;
}

.theme-option:hover,
.choice-option:hover {
    border-color: var(--color-primary);
    transform: translateY(-1px);
}

.theme-option.selected,
.choice-option.selected {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 9%, var(--bg-primary));
    box-shadow: inset 0 0 0 1px var(--color-primary);
}

.theme-swatch {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    border: 3px solid color-mix(in srgb, var(--swatch) 24%, white);
    border-radius: 50%;
    background: var(--swatch);
}

.selected-mark {
    position: absolute;
    right: 0.65rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-primary);
    font-weight: 800;
}

.choice-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.layout-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.choice-option {
    min-height: 76px;
    flex-direction: column;
    justify-content: center;
    font-size: 0.85rem;
}

.radius-preview {
    width: 42px;
    height: 22px;
    border: 2px solid var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.layout-preview {
    display: grid;
    width: 54px;
    height: 28px;
    gap: 3px;
}

.layout-preview--two {
    grid-template-columns: 1fr 2.2fr;
}

.layout-preview--three {
    grid-template-columns: 1fr 2fr 1fr;
}

.layout-preview i {
    border-radius: 2px;
    background: color-mix(in srgb, var(--color-primary) 26%, var(--bg-secondary));
}

@media (max-width: 640px) {
    .setting-group {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .theme-options {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>

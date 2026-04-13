<template>
    <div class="router-container">
        <div class="header">
            <div class="title">主题</div>
        </div>
        <div class="content">
            <Button @click="changeTheme('blue')" size="sm" type="primary">蓝</Button>
            <Button @click="changeTheme('pink')" size="sm" type="primary">粉</Button>
            <Button @click="changeTheme('red')" size="sm" type="primary">红</Button>
            <Button @click="changeTheme('green')" size="sm" type="primary">绿</Button>
            <Button @click="changeTheme('dark')" size="sm" type="primary">黑</Button>
        </div>
        <div class="header">
            <div class="title">圆角</div>
        </div>
        <div class="content">
            <Button @click="changeRadius('small')" size="sm" type="outline" style="border-radius: 4px;">小</Button>
            <Button @click="changeRadius('medium')" size="sm" type="outline" style="border-radius: 8px;">中</Button>
            <Button @click="changeRadius('large')" size="sm" type="outline" style="border-radius: 12px;">大</Button>
        </div>
        <div class="header">
            <div class="title">布局</div>
        </div>
        <div class="content">
            <Button :type="layout === '3' ? 'primary' : 'outline'" size="sm" @click="layout = '3'">三栏</Button>
            <Button :type="layout === '2' ? 'primary' : 'outline'" size="sm" @click="layout = '2'">两栏</Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from '@/components/Button.vue';
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';
import { useRadiusStore } from '@/stores/radius';
import { useLayoutStore } from '@/stores/layout';

const themeStore = useThemeStore();
const radiusStore = useRadiusStore();
const layoutStore = useLayoutStore();
const changeTheme = (theme: string) => {
    console.log('changeTheme called:', theme);
    themeStore.setTheme(theme);
}
const changeRadius = (radius: string) => {
    radiusStore.setRadius(radius);
}

const changeLayout = (layout: string) => {
    layoutStore.setLayout(layout);
}

const theme = computed(() => themeStore.theme);
const layout = computed(() => layoutStore.layout);
</script>
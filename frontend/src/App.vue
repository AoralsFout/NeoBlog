<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { useLayoutStore } from './stores/layout';
import { useRadiusStore } from './stores/radius';
import { useThemeStore } from './stores/theme';
// 初始化主题
const themeStore = useThemeStore();
themeStore.initTheme();
// 初始化圆角
const radiusStore = useRadiusStore();
radiusStore.initRadius();
// 初始化布局
const layoutStore = useLayoutStore();
layoutStore.initLayout();
</script>

<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from './stores/theme';
// 初始化主题
const themeStore = useThemeStore();
themeStore.initTheme();
</script>

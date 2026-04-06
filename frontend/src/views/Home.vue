<template>
    <div class="container">
        <Navigation />
        <div class="header">
            <div class="background"></div>
        </div>
        <div class="content">
            <Card class="card">
                <template v-slot:header>
                    <div>Card Title</div>
                </template>
                <template v-slot:body>
                    <div>Card Content</div>
                    <Button @click="changeTheme('blue')" size="sm" type="primary">更改主题（蓝）</Button>
                    <Button @click="changeTheme('pink')" size="sm" type="secondary">更改主题（粉）</Button>
                    <Button @click="changeTheme('red')" size="sm" type="outline">更改主题（红）</Button>
                    <Button @click="changeTheme('green')" size="sm" type="ghost">更改主题（绿）</Button>
                    <Button @click="changeTheme('dark')" size="sm" type="danger">更改主题（黑）</Button>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import Navigation from '@/components/Navigation.vue';
import Card from '@/components/Card.vue';
import { useThemeStore } from '@/stores/theme';
import Button from '@/components/Button.vue';

const themeStore = useThemeStore();

const changeTheme = (theme: string) => {
    themeStore.setTheme(theme);
}
</script>

<style scoped>
.container {
    display: block;
    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: rgb(0, 0, 0);

    >.header {
        width: 100%;
        height: 400px;
        background-color: #f00;
    }

    >.content {
        width: 100%;
        background-color: #0f0;
    }
}

.card {
    width: 300px;
    height: 200px;
}
</style>
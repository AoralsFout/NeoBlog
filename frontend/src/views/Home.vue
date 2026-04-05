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
                    <button @click="changeTheme('blue')">更改主题（蓝）</button>
                    <button @click="changeTheme('pink')">更改主题（粉）</button>
                    <button @click="changeTheme('red')">更改主题（红）</button>
                    <button @click="changeTheme('green')">更改主题（绿）</button>
                    <button @click="changeTheme('dark')">更改主题（黑）</button>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import Navigation from '@/components/Navigation.vue';
import Card from '@/components/Card.vue';

const changeTheme = (theme: string) => {
    document.documentElement.setAttribute('data-theme', theme);
}
</script>

<style scoped>
.container {
    display: block;
    position: relative;
    width: 100vw;
    height: 100vh;
    background-color: rgb(0, 0, 0);

    >.header{
        width: 100%;
        height: 400px;
        background-color: #f00;
    }

    >.content{
        width: 100%;
        background-color: #0f0;
    }
}

.card {
    width: 300px;
    height: 200px;
}
</style>
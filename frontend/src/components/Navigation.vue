<template>
    <div class="NavigationContainer">
        <div class="navigation-bar">
            <div class="logo">
                <img :src="URL + '/images/logo.png'" alt="" srcset="">
            </div>
            <div class="selections">
                <router-link to="/">Home</router-link>
                <router-link to="/about">About</router-link>
            </div>
            <div class="actions">
                <div class="button"></div>
                <div class="button"></div>
                <div class="button"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const URL = import.meta.env.VITE_API_BASE_URL;
</script>

<style scoped>
.NavigationContainer{
    position: absolute;
    width: calc(100vw - 20px);
    padding: 10px;
}

.navigation-bar {
    width: 90%;
    max-width: 1200px;
    display: flex;
    position: relative;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto;
    padding: 1rem;
    background-color: var(--bg-primary);
    border-radius: 24px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    z-index: 1;

    >.logo {
        width: 150px;

        img {
            width: 100%;
            height: 100%;
            user-select: none;
        }
    }

    >.selections {
        display: flex;
        gap: 1rem;

        a {
            color: var(--text-primary);
            text-decoration: none;
            font-weight: bold;
            font-size: 1rem;
            user-select: none;
        }
    }

    >.actions {
        display: flex;
        justify-content: flex-end;
        width: 200px;
        gap: 1rem;

        .button {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: var(--color-primary);
            cursor: pointer;
        }
    }
}
</style>
<template>
    <div class="NavigationContainer">
        <div class="navigation-bar">
            <div class="logo">
                <img :src="URL + '/images/logo.png'" alt="" srcset="">
            </div>
            <div class="selections">
                <router-link to="/"><span>首页</span></router-link>
                <router-link to="/articles" active-class="active"><span>文章列表</span></router-link>
                <router-link to="/settings" active-class="active"><span>设置</span></router-link>
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
.NavigationContainer {
    position: absolute;
    width: calc(100vw - 20px);
    padding: 10px;
    z-index: 9999;
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
    background-color: color-mix(in srgb, var(--bg-primary) 20%, transparent);
    backdrop-filter: blur(10px);
    border-radius: var(--radius-large);
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
    z-index: 1;
    transform: scale(1);

    transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out, padding 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

    &:hover {
        padding: 1rem 2rem;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    >.logo {
        width: 150px;

        img {
            width: 100%;
            height: 100%;
            user-select: none;
            -webkit-user-drag: none;
        }
    }

    >.selections {
        display: flex;
        gap: 1rem;

        a {
            padding: 0.5rem;
            position: relative;
            color: var(--text-primary);
            text-decoration: none;
            font-weight: bold;
            font-size: 1rem;
            user-select: none;
            transition: color 0.2s ease-in-out;
            z-index: 1;

            span {
                position: relative;
                z-index: 1;
            }

            &:hover::after {
                height: 30%;
            }

            &:hover span,
            &.active span {
                color: var(--text-on-color);
                text-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            &:hover::after,
            &.active::after {
                width: 100%;
            }

            &::after {
                content: '';
                width: 0%;
                height: 20%;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: var(--color-primary);
                z-index: 0;

                transition: background-color 0.2s ease-in-out, width 0.2s ease-in-out, height 0.2s ease-in-out;
            }
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

            transition: background-color 0.2s ease-in-out;
        }
    }
}
</style>
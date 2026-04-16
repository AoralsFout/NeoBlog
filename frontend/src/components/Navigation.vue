<template>
    <div class="NavigationContainer">
        <div class="navigation-bar">
            <div class="logo">
                <img :src="`${URL}/images/logo.png`" alt="" srcset="">
            </div>
            <div class="selections">
                <router-link to="/"><span>首页</span></router-link>
                <router-link to="/articles" active-class="active"><span>文章列表</span></router-link>
                <router-link to="/settings" active-class="active"><span>设置</span></router-link>
            </div>
            <div class="actions">
                <div v-if="!userStore.isAuthenticated" class="auth-buttons">
                    <Button @click="goToLogin" size="md">登录</Button>
                </div>

                <div v-else class="user-menu">
                    <div class="user-avatar" @click="toggleUserMenu">
                        <img v-if="userStore.currentUser?.avatar" :src="userStore.currentUser.avatar" alt="用户头像"
                            class="avatar-img" />
                        <div v-else class="avatar-placeholder">
                            {{ userStore.currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
                        </div>
                    </div>

                    <transition name="fade" mode="out-in">
                        <div v-if="showUserMenu" class="user-dropdown" @click.stop>
                            <div class="dropdown-header">
                                <div class="dropdown-avatar">
                                    <img v-if="userStore.currentUser?.avatar" :src="userStore.currentUser.avatar"
                                        alt="用户头像" />
                                    <div v-else class="dropdown-avatar-placeholder">
                                        {{ userStore.currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
                                    </div>
                                </div>
                                <div class="dropdown-user-info">
                                    <div class="dropdown-username">{{ userStore.currentUser?.username }}</div>
                                    <div class="dropdown-email">{{ userStore.currentUser?.email }}</div>
                                </div>
                            </div>

                            <div class="dropdown-divider"></div>

                            <router-link to="/user" class="dropdown-item" @click="closeUserMenu">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                                个人中心
                            </router-link>

                            <div class="dropdown-divider"></div>

                            <button @click="handleLogout" class="dropdown-item logout-item"
                                :disabled="userStore.isLoading">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                                </svg>
                                {{ userStore.isLoading ? '登出中...' : '退出登录' }}
                            </button>
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeMount, Transition } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import Button from './Button.vue';

const URL = import.meta.env.VITE_FRONTEND_BASE_URL;

const router = useRouter();
const userStore = useUserStore();

const scrollY = ref(0);
const scrollRatio = ref(0);
const showUserMenu = ref(false);

// 初始化用户状态
onBeforeMount(async () => {
    await userStore.initUser();
});

const updateScroll = () => {
    scrollY.value = window.scrollY;
    const windowHeight = window.innerHeight;
    // 滚动60vh时达到最终样式
    const threshold = 0.6 * windowHeight;
    scrollRatio.value = Math.min(scrollY.value / threshold, 1);
    // 设置CSS全局变量
    document.documentElement.style.setProperty('--scroll-ratio', scrollRatio.value.toFixed(2));
};

// 点击登录按钮
const goToLogin = () => {
    router.push('/login');
};

// 切换用户菜单
const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value;
};

// 关闭用户菜单
const closeUserMenu = () => {
    showUserMenu.value = false;
};

// 用户登出
const handleLogout = async () => {
    await userStore.logout();
    closeUserMenu();
    router.push('/');
};

// 点击其他地方关闭菜单
const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
        showUserMenu.value = false;
    }
};

onMounted(() => {
    window.addEventListener('scroll', updateScroll);
    document.addEventListener('click', handleClickOutside);
    updateScroll(); // 初始化
});

onUnmounted(() => {
    window.removeEventListener('scroll', updateScroll);
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/**
 * what fuck css ????
*/
.NavigationContainer {
    position: fixed;
    width: calc(100vw - 20px * (1 - var(--scroll-ratio, 0)));
    padding: calc(10px * (1 - var(--scroll-ratio, 0)));
    transition: width 0.2s ease-in-out, padding 0.2s ease-in-out;
    z-index: 9999;
}

.navigation-bar {
    width: calc(90% + 10% * var(--scroll-ratio, 0) - 2rem);
    max-width: calc(1200px * (1 - var(--scroll-ratio, 0)) + 100% * var(--scroll-ratio, 0));
    background-color: color-mix(in srgb, var(--bg-primary) calc(20% + 80% * var(--scroll-ratio, 0)), transparent);
    backdrop-filter: blur(10px);
    border-radius: calc(var(--radius-large) * (1 - var(--scroll-ratio, 0)));
    display: flex;
    position: relative;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto;
    padding: 1rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    z-index: 1;
    transform: scale(1);

    transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out, padding 0.2s ease-in-out, width 0.2s ease-in-out, max-width 0.2s ease-in-out;

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
                text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
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
        align-items: center;
        width: 200px;
        gap: 1rem;

        .user-menu {
            position: relative;
            display: flex;
            align-items: center;
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid transparent;
            transition: border-color 0.2s ease;

            &:hover {
                border-color: var(--color-primary);
            }

            .avatar-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .avatar-placeholder {
                width: 100%;
                height: 100%;
                background-color: var(--color-primary);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 1rem;
            }
        }

        .user-dropdown {
            position: absolute;
            top: calc(100% + 20px);
            right: 0;
            width: 280px;
            background-color: var(--bg-secondary);
            border-radius: var(--radius-large);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            border: 1px solid var(--border-color);
            z-index: 1000;
            overflow: hidden;

            .dropdown-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1.5rem;
                background-color: var(--bg-primary);
            }

            .dropdown-avatar {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                overflow: hidden;
                flex-shrink: 0;

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .dropdown-avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    background-color: var(--color-primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                }
            }

            .dropdown-user-info {
                flex: 1;
                overflow: hidden;
            }

            .dropdown-username {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 0.25rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .dropdown-email {
                font-size: 0.85rem;
                color: var(--text-secondary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .dropdown-divider {
                height: 1px;
                background-color: var(--border-color);
            }

            .dropdown-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem 1.5rem;
                color: var(--text-primary);
                text-decoration: none;
                cursor: pointer;
                transition: background-color 0.2s ease;
                background: none;
                border: none;
                width: 100%;
                text-align: left;
                font-size: 0.95rem;

                &:hover {
                    background-color: var(--bg-primary);
                }

                &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                svg {
                    width: 18px;
                    height: 18px;
                    color: var(--text-secondary);
                    flex-shrink: 0;
                }

                &.logout-item {
                    color: #f5222d;

                    svg {
                        color: #f5222d;
                    }

                    &:hover:not(:disabled) {
                        background-color: rgba(220, 53, 69, 0.1);
                    }
                }
            }
        }
    }
}
</style>
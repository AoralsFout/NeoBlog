<template>
    <div class="NavigationContainer" :class="{ 'menu-open': showMobileNav }">
        <nav class="navigation-bar" aria-label="主导航">
            <router-link to="/" class="brand" aria-label="NeoBlog 首页" @click="closeMobileNav">
                <span class="brand-mark" aria-hidden="true">N</span>
                <span class="brand-copy">
                    <strong>NeoBlog</strong>
                    <small>PERSONAL SIGNAL</small>
                </span>
            </router-link>

            <div id="primary-navigation" class="selections" :class="{ open: showMobileNav }">
                <router-link to="/articles" active-class="active" @click="closeMobileNav"><span>文章</span></router-link>
                <router-link to="/settings" active-class="active" @click="closeMobileNav"><span>设置</span></router-link>
            </div>

            <div class="actions">
                <div v-if="!userStore.isAuthenticated" class="auth-buttons">
                    <Button @click="goToLogin" size="md">登录</Button>
                </div>

                <div v-else class="user-menu">
                    <button class="user-avatar" type="button" aria-label="打开用户菜单"
                        :aria-expanded="showUserMenu" @click="toggleUserMenu">
                        <img v-if="userStore.currentUser?.avatar" :src="userStore.currentUser.avatar" alt="用户头像"
                            class="avatar-img" />
                        <div v-else class="avatar-placeholder">
                            {{ userStore.currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
                        </div>
                    </button>

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

            <button class="mobile-menu-toggle" type="button" aria-label="切换导航菜单"
                aria-controls="primary-navigation" :aria-expanded="showMobileNav" @click="toggleMobileNav">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import Button from './Button.vue';

const router = useRouter();
const userStore = useUserStore();

const scrollY = ref(0);
const scrollRatio = ref(0);
const showUserMenu = ref(false);
const showMobileNav = ref(false);

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
    closeMobileNav();
    router.push('/login');
};

const toggleMobileNav = () => {
    showMobileNav.value = !showMobileNav.value;
};

const closeMobileNav = () => {
    showMobileNav.value = false;
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
    if (!target.closest('.NavigationContainer')) {
        closeMobileNav();
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
    transition: all 0.1s ease-in-out;
}

.fade-enter-from {
    transform: translateY(-10px);
    opacity: 0;
}

.fade-leave-to {
    transform: translateY(0px);
    opacity: 0;
}

.NavigationContainer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: calc(10px * (1 - var(--scroll-ratio, 0)));
    transition: width 0.2s ease-in-out, padding 0.2s ease-in-out;
    z-index: 9999;
}

.navigation-bar {
    width: calc(90% + 10% * var(--scroll-ratio, 0));
    max-width: calc(1200px * (1 - var(--scroll-ratio, 0)) + 100% * var(--scroll-ratio, 0));
    background-color: color-mix(in srgb, var(--bg-primary) calc(20% + 80% * var(--scroll-ratio, 0)), transparent);
    backdrop-filter: blur(10px);
    border-radius: calc(var(--radius-large) * (1 - var(--scroll-ratio, 0)));
    display: flex;
    position: relative;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto;
    padding: 0.75rem 1rem;
    border: 1px solid color-mix(in srgb, var(--border-color) 58%, transparent);
    box-shadow: 0 12px 36px rgba(20, 28, 48, 0.12);
    z-index: 1;
    transform: scale(1);

    transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out, padding 0.2s ease-in-out, width 0.2s ease-in-out, max-width 0.2s ease-in-out;

    >.brand {
        display: inline-flex;
        align-items: center;
        gap: 0.7rem;
        min-width: 190px;
        color: var(--text-primary);
        text-decoration: none;
        font-family: var(--font-display);

        .brand-mark {
            display: grid;
            width: 38px;
            height: 38px;
            place-items: center;
            border-radius: 10px 4px 10px 4px;
            background: var(--color-primary);
            color: var(--text-on-color);
            font-size: 1.1rem;
            font-weight: 800;
            box-shadow: 5px 5px 0 color-mix(in srgb, var(--color-secondary) 34%, transparent);
        }

        .brand-copy {
            display: flex;
            flex-direction: column;
            line-height: 1.05;

            strong {
                font-size: 1rem;
                letter-spacing: -0.03em;
            }

            small {
                margin-top: 0.35rem;
                width: max-content;
                padding: 0.12rem 0.34rem;
                border: 1px solid color-mix(in srgb, var(--border-color) 68%, transparent);
                border-radius: 999px;
                background: color-mix(in srgb, var(--bg-primary) 76%, transparent);
                color: var(--text-primary);
                font-size: 0.56rem;
                font-weight: 700;
                letter-spacing: 0.16em;
                backdrop-filter: blur(5px);
            }
        }
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
        gap: 0.35rem;

        a {
            padding: 0.5rem;
            position: relative;
            color: var(--text-primary);
            text-decoration: none;
            border-radius: var(--radius-small);
            font-family: var(--font-display);
            font-weight: 600;
            font-size: 0.9rem;
            user-select: none;
            transition: color 0.2s ease-in-out;
            z-index: 1;

            span {
                position: relative;
                z-index: 1;
            }

            &:hover span {
                color: var(--color-primary);
            }

            &.active::after {
                width: 100%;
            }

            &.active span {
                color: var(--text-primary);
            }

            &::after {
                content: '';
                width: 0%;
                height: 2px;
                position: absolute;
                top: auto;
                bottom: 0.2rem;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: var(--color-primary);
                z-index: 0;

                transition: background-color 0.2s ease-in-out, width 0.2s ease-in-out;
            }
        }
    }

    >.actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        min-width: 190px;
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
            padding: 0;
            background: transparent;
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

.mobile-menu-toggle {
    display: none;
    width: 42px;
    height: 42px;
    padding: 9px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-small);
    background: var(--surface-card);
    cursor: pointer;

    span {
        display: block;
        width: 100%;
        height: 2px;
        margin: 4px 0;
        border-radius: 99px;
        background: var(--text-primary);
        transition: transform 0.2s ease, opacity 0.2s ease;
    }
}

@media (max-width: 768px) {
    .NavigationContainer {
        width: 100%;
        padding: 8px;
    }

    .navigation-bar {
        width: 100%;
        max-width: none;
        padding: 0.6rem 0.7rem;
        border-radius: var(--radius-medium);
        background-color: color-mix(in srgb, var(--bg-primary) 88%, transparent);
    }

    .navigation-bar > .brand {
        min-width: 0;
        margin-right: auto;

        .brand-mark {
            width: 36px;
            height: 36px;
        }

        .brand-copy small {
            display: none;
        }
    }

    .navigation-bar > .selections {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        left: 0;
        display: grid;
        gap: 0.35rem;
        padding: 0.55rem;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-medium);
        background: color-mix(in srgb, var(--bg-primary) 96%, transparent);
        box-shadow: var(--shadow-card);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s;

        &.open {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        a {
            padding: 0.75rem 0.9rem;
        }
    }

    .navigation-bar > .actions {
        min-width: 0;
        margin-left: 0.5rem;

        .neo-btn {
            padding: 0.45rem 0.75rem;
        }

        .user-dropdown {
            right: -52px;
            width: min(280px, calc(100vw - 32px));
        }
    }

    .mobile-menu-toggle {
        display: block;
        margin-left: 0.45rem;
    }

    .menu-open .mobile-menu-toggle span:nth-child(1) {
        transform: translateY(6px) rotate(45deg);
    }

    .menu-open .mobile-menu-toggle span:nth-child(2) {
        opacity: 0;
    }

    .menu-open .mobile-menu-toggle span:nth-child(3) {
        transform: translateY(-6px) rotate(-45deg);
    }
}
</style>

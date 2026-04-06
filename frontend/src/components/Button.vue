<!-- e:\NeoBlog\frontend\src\components\Button.vue -->
<template>
    <button
        :class="['neo-btn', `neo-btn--${type}`, `neo-btn--${size}`, { 'is-loading': loading, 'is-disabled': disabled }]"
        :disabled="disabled || loading" v-bind="$attrs" @click="handleClick">
        <span v-if="loading" class="neo-btn__loader">
            <svg class="neo-btn__spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </span>

        <span class="neo-btn__content">
            <slot />
        </span>
    </button>
</template>

<script setup lang="ts">
// 定义 Props
interface Props {
    /** 按钮类型 */
    type?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    /** 按钮尺寸 */
    size?: 'sm' | 'md' | 'lg'
    /** 是否禁用 */
    disabled?: boolean
    /** 是否加载中 */
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    type: 'primary',
    size: 'md',
    disabled: false,
    loading: false
})

// 定义 Emits
const emit = defineEmits<{
    (e: 'click', event: MouseEvent): void
}>()

// 处理点击事件，如果禁用或加载中则不触发
const handleClick = (event: MouseEvent) => {
    if (!props.disabled && !props.loading) {
        emit('click', event)
    }
}
</script>

<style scoped>
.neo-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    border-radius: 0.375rem;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    border: none;
    margin: 2px;
    outline: none;
    line-height: 1.5;
}

.neo-btn:disabled,
.neo-btn.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
}

/* 尺寸变体 */
.neo-btn--sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
}

.neo-btn--md {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.neo-btn--lg {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
}

/* 样式变体 */

/* Primary */
.neo-btn--primary {
    background-color: var(--color-primary);
    color: var(--text-on-color);
    border: 1px solid transparent;
}

.neo-btn--primary:hover:not(:disabled) {
    background-color: var(--color-secondary);
}

/* Secondary */
.neo-btn--secondary {
    background-color: var(--color-secondary);
    color: var(--text-on-color);
    border: 1px solid transparent;
}

.neo-btn--secondary:hover:not(:disabled) {
    background-color: var(--color-primary);
}

/* Outline */
.neo-btn--outline {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--color-primary);
}

.neo-btn--outline:hover:not(:disabled) {
    color: var(--text-on-color);
    background-color: var(--color-primary);
}

/* Ghost */
.neo-btn--ghost {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid transparent;
}

.neo-btn--ghost:hover:not(:disabled) {
    border: 1px solid var(--color-primary);
}

/* Danger */
.neo-btn--danger {
    background-color: #f00;
    color: #fff;
}

.neo-btn--danger:hover:not(:disabled) {
    background-color: rgb(200, 0, 0);
}

/* 加载动画 */
.neo-btn__loader {
    display: flex;
    align-items: center;
    margin-right: 0.5rem;
}

.neo-btn__spinner {
    animation: spin 1s linear infinite;
    height: 1rem;
    width: 1rem;
    color: currentColor;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.neo-btn__content {
    display: flex;
    align-items: center;
}
</style>
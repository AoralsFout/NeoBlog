<template>
    <div class="cardContainer">
        <div v-if="$slots.header" class="card-header">
            <slot name="header"></slot>
        </div>
        <div>
            <slot name="body"></slot>
        </div>
    </div>
</template>

<style scoped>
.cardContainer {
    width: 100%;

    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    overflow: hidden;

    background-color: var(--surface-card);
    border: 1px solid color-mix(in srgb, var(--border-color) 72%, transparent);
    border-radius: var(--radius-medium);
    box-shadow: var(--shadow-card);

    transition: background-color 0.2s ease-in-out, border-radius 0.2s ease-in-out;

    >.card-header {
        position: relative;
        padding: 10px 10px 10px 20px;

        font-size: 16px;
        font-weight: bold;

        border-bottom: 1px solid color-mix(in srgb, var(--border-color) 72%, transparent);
        font-family: var(--font-display);

        &::after {
            content: '';
            position: absolute;
            top: 10px;
            left: 10px;
            width: 6px;
            border-radius: 3px;
            height: calc(100% - 20px);

            background-color: var(--color-primary);

            transition: background-color 0.2s ease-in-out;
        }
    }
}
</style>

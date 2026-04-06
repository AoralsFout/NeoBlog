<template>
    <div class="cardContainer">
        <div class="card-header">
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
    height: 100%;

    display: flex;
    flex-direction: column;

    background-color: var(--bg-primary);
    border-radius: var(--radius-small);
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

    >.card-header{
        position: relative;
        padding: 10px 10px 10px 20px;

        font-size: 16px;
        font-weight: bold;

        border-bottom: 1px dashed var(--color-primary);

        &::after{
            content: '';
            position: absolute;
            top: 10px;
            left: 10px;
            width: 5px;
            height: calc(100% - 20px);

            background-color: var(--color-primary);
        }
    }
}
</style>
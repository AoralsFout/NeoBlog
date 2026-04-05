<template>
    <div class="cardContainer">
        <div class="card-header">
            <slot name="header"></slot>
        </div>
        <div class="card-body">
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
    border-radius: 12px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);

    >.card-header{
        position: relative;
        padding: 10px 10px 10px 20px;

        font-size: 16px;
        font-weight: bold;

        border-bottom: 1px dashed #ccc;

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
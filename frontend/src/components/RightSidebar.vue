<template>
    <Card>
        <template #body>
            <div class="card-body">
                <div class="time-container">{{ time }}</div>
                <div class="time-tips">{{ timeTips }}</div>
            </div>
        </template>
    </Card>
    <Card>
        <template #header>右侧卡片2</template>
        <template #body>
            <div class="card-body">
                <p>Ciallo～(∠・ω< )⌒★</p>
            </div>
        </template>
    </Card>
</template>

<script setup lang="ts">
import Card from '@/components/Card.vue';
import { onMounted, onUnmounted, ref } from 'vue';

const time = ref<string>("--:--:--");
const timeTips = ref<string>("加载中");
const timer = ref<number | null>(null);
const lastDate = ref<Date>(new Date());

if (lastDate.value.getHours() >= 0 && lastDate.value.getHours() < 5) {
    timeTips.value = "明月高照，你的心里正在想什么呢？";
} else if (lastDate.value.getHours() >= 5 && lastDate.value.getHours() < 9) {
    timeTips.value = "早上好呀！新的一天开始啦，记得吃早餐哦～(≧∇≦)ﾉ";
} else if (lastDate.value.getHours() >= 9 && lastDate.value.getHours() < 12) {
    timeTips.value = "上午好！工作/学习加油鸭，保持元气满满！";
} else if (lastDate.value.getHours() >= 12 && lastDate.value.getHours() < 14 ) {
    timeTips.value = "中午好！吃饱饱才能有力气下午继续冲呀～";
} else if (lastDate.value.getHours() >= 14 && lastDate.value.getHours() < 18) {
    timeTips.value = "下午好！喝杯茶提提神，效率加倍哦～";
} else if (lastDate.value.getHours() >= 18 && lastDate.value.getHours() < 22) {
    timeTips.value = "今天就要结束了！辛苦了一天，好好放松一下吧～";
} else if (lastDate.value.getHours() >= 22) {
    timeTips.value = "夜深啦，早点休息哦，好梦～";
}

const updateTime = () => {
    const date = new Date();
    // 更新时间
    time.value = `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;

    // 更新提示
    const cur = date.getHours();
    const prev = lastDate.value.getHours();
    if (cur >= 0 && cur < 5 && prev >= 5) {
        timeTips.value = "明月高照，你的心里正在想什么呢？";
        lastDate.value = date;
    } else if (cur >= 5 && cur < 9 && (prev < 5 || prev >= 9)) {
        timeTips.value = "早上好呀！新的一天开始啦，记得吃早餐哦～(≧∇≦)ﾉ";
        lastDate.value = date;
    } else if (cur >= 9 && cur < 12 && (prev < 9 || prev >= 12)) {
        timeTips.value = "上午好！工作/学习加油鸭，保持元气满满！";
        lastDate.value = date;
    } else if (cur >= 12 && cur < 14 && (prev < 12 || prev >= 14)) {
        timeTips.value = "中午好！吃饱饱才能有力气下午继续冲呀～";
        lastDate.value = date;
    } else if (cur >= 14 && cur < 18 && (prev < 14 || prev >= 18)) {
        timeTips.value = "下午好！喝杯茶提提神，效率加倍哦～";
        lastDate.value = date;
    } else if (cur >= 18 && cur < 22 && (prev < 18 || prev >= 22)) {
        timeTips.value = "今天就要结束了！辛苦了一天，好好放松一下吧～";
        lastDate.value = date;
    } else if (cur >= 22 && prev < 22) {
        timeTips.value = "夜深啦，早点休息哦，好梦～";
        lastDate.value = date;
    }
};

const padZero = (num: number) => {
    return num < 10 ? `0${num}` : num;
};

onMounted(() => {
    timer.value = setInterval(updateTime, 1000);
});

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
    }
});
</script>

<style scoped>
.time-container {
    padding: 1rem;
    text-align: center;
    font-size: 1.5rem;
    font-weight: bold;
}

.time-tips {
    padding: var(--radius-small);
}
</style>
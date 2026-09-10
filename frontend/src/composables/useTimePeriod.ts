import { ref, computed, watch, onScopeDispose, getCurrentScope } from 'vue';

/**
 * 一天中的时段。
 *
 * 背景：RightSidebar.vue 曾把时段判定写三份——getPeriod(hour) 一份边界逻辑，
 * 初始化时一条 7 分支 if/else if 链，运行时又一条 7 分支链（比对 prev/cur）。
 * 边界常量 5/9/12/14/18/22 在文件里出现三遍，并用 lastDate ref 记录"上次提示所属时段"。
 *
 * 现在：边界表是唯一来源，时段由时间派生，问候语只在跨段时更新。
 */

export type Period = 'deep-night' | 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'midnight';

/**
 * 时段边界表（唯一来源）。
 * `beforeHour` 表示"小时数小于该值时属于本时段"，按顺序匹配。
 */
const PERIOD_BOUNDARIES: ReadonlyArray<{ beforeHour: number; period: Period }> = [
  { beforeHour: 5, period: 'deep-night' },
  { beforeHour: 9, period: 'dawn' },
  { beforeHour: 12, period: 'morning' },
  { beforeHour: 14, period: 'noon' },
  { beforeHour: 18, period: 'afternoon' },
  { beforeHour: 22, period: 'dusk' },
  { beforeHour: 24, period: 'midnight' },
];

/** 各时段的问候语 */
export const TIP_BY_PERIOD: Record<Period, string> = {
  'deep-night': '明月高照，你的心里正在想什么呢？',
  dawn: '早上好呀！新的一天开始啦，记得吃早餐哦～(≧∇≦)ﾉ',
  morning: '上午好！工作/学习加油鸭，保持元气满满！',
  noon: '中午好！吃饱饱才能有力气下午继续冲呀～',
  afternoon: '下午好！喝杯茶提提神，效率加倍哦～',
  dusk: '今天就要结束了！辛苦了一天，好好放松一下吧～',
  midnight: '夜深啦，早点休息哦，好梦～',
};

/** 各时段的展示名（当前 UI 未使用，保留以便统一扩展） */
export const LABEL_BY_PERIOD: Record<Period, string> = {
  'deep-night': '凌晨',
  dawn: '清晨',
  morning: '上午',
  noon: '正午',
  afternoon: '下午',
  dusk: '傍晚',
  midnight: '深夜',
};

/** 纯函数：由小时数得到时段 */
export const periodOfHour = (hour: number): Period => {
  const found = PERIOD_BOUNDARIES.find((entry) => hour < entry.beforeHour);
  return found ? found.period : 'midnight';
};

/** 纯函数：由日期得到时段 */
export const periodOf = (date: Date): Period => periodOfHour(date.getHours());

const padZero = (num: number): string => (num < 10 ? `0${num}` : String(num));

/** 纯函数：格式化为 HH:mm:ss */
export const formatClock = (date: Date): string =>
  `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;

export interface TimePeriodState {
  /** HH:mm:ss 形式的当前时间，每秒更新 */
  time: import('vue').Ref<string>;
  /** 当前时段，随时间派生 */
  period: import('vue').Ref<Period>;
  /** 当前时段的问候语；仅在跨段时更新 */
  tip: import('vue').Ref<string>;
}

/**
 * 订阅当前时间与时段。
 *
 * 时钟字符串每秒更新（显示需要），时段由时钟派生，
 * 问候语通过 watch(period) 只在跨段时写入——不需要 prev/cur 手工比对。
 */
export function useTimePeriod(options: { tickMs?: number } = {}): TimePeriodState {
  const tickMs = options.tickMs ?? 1000;

  const now = ref(new Date());
  const time = ref(formatClock(now.value));
  const period = computed(() => periodOf(now.value));
  const tip = ref(TIP_BY_PERIOD[period.value]);

  const timer = setInterval(() => {
    now.value = new Date();
    time.value = formatClock(now.value);
  }, tickMs);

  // 仅在时段真正变化时更新问候语（跨段一次）
  watch(period, (next) => {
    tip.value = TIP_BY_PERIOD[next];
  });

  if (getCurrentScope()) {
    onScopeDispose(() => clearInterval(timer));
  }

  return { time, period, tip };
}

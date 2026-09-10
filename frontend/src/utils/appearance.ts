/**
 * 主题与圆角的共享定义。
 *
 * 背景：圆角档位此前在 JS（stores/radius.ts 的 radiusArray + switch）与
 * Settings.vue（预览值硬编码）两处各自定义，且取值不一致——用户看到"平衡 10px"
 * 但实际 --radius-small 是 8px。本文件是这三个值的唯一定义处，
 * 实际变量映射由 CSS（assets/themes/root.css 的 [data-radius] 块）表达。
 */

export type RadiusName = 'small' | 'medium' | 'large';

export interface RadiusOption {
  value: RadiusName;
  label: string;
  /** 该档位下 --radius-small / medium / large 的实际取值 */
  values: readonly [string, string, string];
  /** 设置页预览用（取 --radius-small，即最直观能看到差异的值） */
  preview: string;
}

export const RADIUS_OPTIONS: readonly RadiusOption[] = [
  { value: 'small', label: '利落', values: ['4px', '8px', '12px'], preview: '4px' },
  { value: 'medium', label: '平衡', values: ['8px', '12px', '16px'], preview: '8px' },
  { value: 'large', label: '柔和', values: ['12px', '16px', '20px'], preview: '12px' },
] as const;

export const DEFAULT_RADIUS: RadiusName = 'small';

export const isRadiusName = (value: unknown): value is RadiusName =>
  typeof value === 'string' && RADIUS_OPTIONS.some((option) => option.value === value);

/**
 * 主题色选项（设置页展示用；实际颜色变量定义在各 themes/*.css 中）
 */
export type ThemeName = 'blue' | 'pink' | 'red' | 'green' | 'dark';

export interface ThemeOption {
  value: ThemeName;
  label: string;
  /** 设置页色块展示色，需与 themes/<name>.css 的 --color-primary 保持一致 */
  color: string;
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  { value: 'blue', label: '深海蓝', color: '#0066cc' },
  { value: 'pink', label: '樱桃粉', color: '#eb2f96' },
  { value: 'red', label: '信号红', color: '#cf1322' },
  { value: 'green', label: '薄荷绿', color: '#00a86b' },
  { value: 'dark', label: '夜航黑', color: '#6577a8' },
] as const;

export const isThemeName = (value: unknown): value is ThemeName =>
  typeof value === 'string' && THEME_OPTIONS.some((option) => option.value === value);

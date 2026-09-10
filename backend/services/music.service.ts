import prisma from '../config/database';

/**
 * 音乐条目
 *
 * 字段由 SELECT_MUSIC_FIELDS 显式选取，与对外契约保持一一对应。
 */
export interface MusicItem {
  id: number;
  title: string;
  author: string;
  album: string | null;
  mainColor: string | null;
  language: string | null;
  isTranslate: boolean | null;
  format: string | null;
}

/**
 * 对外返回的字段集合（唯一来源，列表与详情共用）。
 * 显式 select 而非 select 全表，避免把 duration / chorusIn / BPM 等
 * 前端未使用的内部字段透传出去。
 */
const SELECT_MUSIC_FIELDS = {
  id: true,
  title: true,
  author: true,
  album: true,
  mainColor: true,
  language: true,
  isTranslate: true,
  format: true,
} as const;

/**
 * 音乐服务
 *
 * 历史：本服务曾对 Prisma Music 模型使用 `@ts-ignore`，并在 catch 中回退到
 * `$queryRaw` 原始 SQL，再用 `error.message.includes("doesn't exist")` /
 * `includes('不存在')` 判断表缺失后返回空数组。
 *
 * 该回退是历史遗留的猜测性防御：Prisma schema 中 Music 模型早已定义
 * （映射 musics 表），且实测可直接查询。现已删除回退与字符串错误匹配。
 */
class MusicService {
  /**
   * 获取音乐列表
   */
  async getMusicList(): Promise<MusicItem[]> {
    return prisma.music.findMany({
      select: SELECT_MUSIC_FIELDS,
      orderBy: { id: 'asc' },
    });
  }

  /**
   * 根据ID获取音乐信息
   */
  async getMusicById(id: number): Promise<MusicItem | null> {
    return prisma.music.findUnique({
      where: { id },
      select: SELECT_MUSIC_FIELDS,
    });
  }
}

export default new MusicService();

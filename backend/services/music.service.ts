import prisma from '../config/database';
import logger from '../utils/logger';

interface MusicItem {
  id: number;
  title: string;
  author: string;
  album: string;
  mainColor: string;
  language: string;
  isTranslate: boolean;
  format: string;
}

class MusicService {
  /**
   * 获取音乐列表
   */
  async getMusicList(): Promise<MusicItem[]> {
    try {
      // 先尝试使用Prisma模型查询（如果模型存在）
      try {
        // @ts-ignore - 如果Music模型不存在会报错
        const musicList = await prisma.music.findMany({
          orderBy: { id: 'asc' },
        });
        return musicList;
      } catch (prismaError) {
        // 如果Prisma模型不存在，使用原始SQL查询
        logger.info('Prisma Music模型不存在，尝试原始SQL查询');

        // 使用原始SQL查询musics表
        const musicList = await prisma.$queryRaw<MusicItem[]>`
          SELECT id, title, author, album, mainColor, language, isTranslate, format
          FROM musics
          ORDER BY id ASC
        `;

        return musicList;
      }
    } catch (error) {
      logger.error('获取音乐列表失败:', error);

      // 如果表不存在，返回空数组
      if (error instanceof Error && error.message.includes('doesn\'t exist') ||
          error instanceof Error && error.message.includes('不存在')) {
        logger.warn('musics表不存在，返回空数组');
        return [];
      }

      throw new Error(`获取音乐列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据ID获取音乐信息
   */
  async getMusicById(id: number): Promise<MusicItem | null> {
    try {
      try {
        // @ts-ignore - 如果Music模型不存在会报错
        const music = await prisma.music.findUnique({
          where: { id },
        });
        return music;
      } catch (prismaError) {
        // 使用原始SQL查询
        const result = await prisma.$queryRaw<MusicItem[]>`
          SELECT id, title, author, album, mainColor, language, isTranslate, format
          FROM musics
          WHERE id = ${id}
          LIMIT 1
        `;

        return result.length > 0 ? result[0] : null;
      }
    } catch (error) {
      logger.error(`获取音乐信息失败 (ID: ${id}):`, error);
      return null;
    }
  }
}

export default new MusicService();
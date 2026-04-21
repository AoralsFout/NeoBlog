import { Request, Response } from 'express';
import musicService from '../services/music.service';
import logger from '../utils/logger';

/**
 * 获取音乐列表
 */
export const getMusicList = async (req: Request, res: Response) => {
  try {
    const musicList = await musicService.getMusicList();

    // 转换为前端期望的格式
    const formattedList = musicList.map(music => ({
      id: music.id,
      title: music.title,
      author: music.author,
      album: music.album,
      // 注意：前端会动态生成 coverUrl，但这里也可以直接返回
      // coverUrl: `/musics/cover/${music.id}.jpg`,
      mainColor: music.mainColor,
      language: music.language,
      isTranslate: music.isTranslate? 1 : 0, // 前端期望number类型：0或1
      format: music.format,
    }));

    res.json({
      code: 200,
      message: '成功',
      data: formattedList,
    });
  } catch (error) {
    logger.error('获取音乐列表失败:', error);

    res.status(500).json({
      code: 500,
      message: '获取音乐列表失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
};
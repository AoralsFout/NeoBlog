import { PrismaClient } from '@prisma/client';

// 扩展PrismaClient类型以添加断开连接方法
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// 数据库连接状态检查
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
};

// 关闭
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};

export default prisma;
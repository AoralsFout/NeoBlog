import winston from 'winston';
import { env } from '../config/env';

// 定义日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 根据环境定义日志级别（生产环境保留info，记录请求与关键事件）
const level = () => {
  return env.nodeEnv === 'development' ? 'debug' : 'info';
};

// 定义颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// 基础格式（控制台与文件共用）
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label', 'metadata'] })
);

const printf = ({ timestamp, level, message, metadata }: any) => {
  return `${timestamp} [${level}]: ${message} ${Object.keys(metadata || {}).length ? JSON.stringify(metadata) : ''}`;
};

// 定义输出
const transports = [
  // 控制台：彩色输出
  new winston.transports.Console({
    format: winston.format.combine(
      baseFormat,
      winston.format.colorize({ all: true }),
      winston.format.printf(printf)
    ),
  }),
  // 文件：无颜色代码，避免日志文件被ANSI污染
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(baseFormat, winston.format.printf(printf)),
  }),
  new winston.transports.File({
    filename: 'logs/all.log',
    format: winston.format.combine(baseFormat, winston.format.printf(printf)),
  }),
];

// 创建logger实例
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

export default logger;

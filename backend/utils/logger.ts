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

// 根据环境定义日志级别
const level = () => {
  return env.nodeEnv === 'development' ? 'debug' : 'warn';
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

// 定义格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label', 'metadata'] }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(metadata!).length ? JSON.stringify(metadata) : ''}`;
  })
);

// 定义输出
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// 创建logger实例
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

export default logger;
import express, { Request, Response } from 'express';

const app = express();
const port = 3001;

// 中间件：解析 JSON 请求体
app.use(express.json());

// 路由示例
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World! NeoBlog Backend is running.');
});

// 启动服务
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
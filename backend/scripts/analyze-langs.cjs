// 临时分析：统计文章 Markdown 代码块实际使用的语言，为按需注册 highlight.js 提供依据。
require('dotenv').config({ path: '.env.development' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['error'] });

(async () => {
  const articles = await prisma.article.findMany({ select: { id: true, content: true } });
  console.log('ARTICLE_COUNT=' + articles.length);

  const fence = /```([A-Za-z0-9+#._-]*)/g;
  const counts = {};
  let totalFences = 0;
  for (const a of articles) {
    let m;
    while ((m = fence.exec(a.content || '')) !== null) {
      const lang = (m[1] || '(none)').toLowerCase();
      counts[lang] = (counts[lang] || 0) + 1;
      totalFences++;
    }
    fence.lastIndex = 0;
  }
  console.log('TOTAL_FENCES=' + totalFences);
  console.log('LANGS=' + JSON.stringify(counts));
  console.log('DISTINCT_LANGS=' + Object.keys(counts).length);

  // 同时看看 ArticleEditor 里是否有默认语言提示
  await prisma.$disconnect();
})();

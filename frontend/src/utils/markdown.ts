import { Marked, Renderer } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import type { Tokens } from 'marked';

/**
 * Markdown 渲染与目录（TOC）大纲提取的统一实现。
 *
 * 背景：此前 ArticleDetail.vue 用模块级可变计数器生成标题 id，
 * 渲染后再用正则从已渲染 HTML 里"猜回"标题列表，并存入全局 store
 * 供 Home.vue 读取。存在三个问题：
 *   1. headingIndex 是模块级变量，跨文章/跨组件实例共享，仅靠"每次渲染前重置"侥幸正确
 *   2. 标题列表靠正则反解析 DOMPurify 之后的 HTML，sanitize 配置一变就静默失效
 *   3. 同一次渲染 renderMarkdown 被调用两次（computed 与加载函数各一次）
 *
 * 现在：一次调用同时返回最终 HTML 与生成时收集的大纲，不再反解析。
 */

/** 目录条目 */
export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/** 渲染结果 */
export interface RenderedArticle {
  html: string;
  headings: TocHeading[];
}

/**
 * HTML 清洗策略（编辑器预览与详情页共用，避免两处配置漂移）。
 * 保留 id 属性，因为目录锚点依赖它。
 */
const SANITIZE_CONFIG = {
  FORBID_TAGS: ['style', 'form', 'input', 'iframe', 'object', 'embed'],
};

const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, SANITIZE_CONFIG);

/** 标题 id 前缀，便于定位与调试 */
const HEADING_ID_PREFIX = 'heading-';

/** 只有 h1~h3 进入目录 */
const TOC_MAX_LEVEL = 3;

const stripTags = (value: string): string => value.replace(/<[^>]*>/g, '').trim();

/**
 * 从纯文本内容渲染 Markdown，并返回正文 HTML 与目录大纲。
 *
 * 标题 id 由**本次调用内部**的局部计数器生成（不再是模块级状态），
 * 因此连续/并发渲染之间不会互相污染。
 *
 * 注意：使用 `new Marked({...})` 实例而不是全局 `marked.use()`，
 * 后者会污染全局渲染器，导致预览与详情页互相影响。
 */
export function renderArticle(content: string): RenderedArticle {
  const headings: TocHeading[] = [];
  let counter = 0;

  const renderer = new Renderer();

  renderer.heading = function ({ tokens, depth }: Tokens.Heading): string {
    const text = this.parser.parseInline(tokens);
    const id = `${HEADING_ID_PREFIX}${counter++}`;

    if (depth <= TOC_MAX_LEVEL) {
      headings.push({ id, text: stripTags(text), level: depth });
    }

    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  // 代码块语法高亮
  renderer.code = function ({ text, lang }: Tokens.Code): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(text, { language: lang }).value;
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      } catch {
        // 高亮失败时回退为纯文本代码块
      }
    }
    return `<pre><code>${text}</code></pre>`;
  };

  const parser = new Marked({ renderer, breaks: true, gfm: true });
  const rawHtml = parser.parse(content) as string;

  return {
    html: sanitizeHtml(rawHtml),
    headings,
  };
}

/**
 * 仅渲染 Markdown 为已清洗的 HTML（编辑器预览用，不关心大纲）。
 */
export function renderMarkdown(content: string): string {
  return renderArticle(content).html;
}

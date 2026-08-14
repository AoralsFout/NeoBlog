export interface Article {
  id: number;
  title: string;
  /** 列表接口不返回正文 */
  content?: string;
  summary: string | null;
  cover_image: string | null;
  tags: string | null;
  views: number;
  author_id: number;
  comment_count: number;
  author?: {
    id: number;
    username: string;
    avatar: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ArticleListResponse {
  success: boolean;
  articles: Article[];
  pagination: Pagination;
}

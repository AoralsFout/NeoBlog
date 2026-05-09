export interface Article {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  cover_image: string | null;
  tags: string | null;
  views: number;
  author_id: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    username: string;
    avatar: string | null;
  };
  comment_count?: number;
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  sort?: 'time' | 'hot';
  tag?: string;
}

export interface PaginatedArticles {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

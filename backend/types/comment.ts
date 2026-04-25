export type Reaction = "like" | "dislike";

export interface CommentReaction {
  id: number;
  comment_id: number;
  user_id: number;
  type: Reaction;
  created_at: string;
}

export interface Comment {
  id: number;
  content: string;
  source_id: string;
  source_type: string;
  user_id: number;
  parent_id: number | null;
  likes_count: number;
  dislikes_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar: string;
  };
  user_reaction?: Reaction | null;
  replies?: Comment[];
}

export interface PaginatedComments {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

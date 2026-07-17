export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type?: 'tech' | 'general';
  postCount: number;
  createdAt: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  isStaff: boolean;
  status?: 'open_to_work' | 'hiring' | 'mentoring' | 'open_for_mentorship';
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  contentMdx: string;
  contentHtml?: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  status: "draft" | "review" | "scheduled" | "published" | "archived";
  visibility: "public" | "unlisted" | "private";
  postType?: 'article' | 'project';
  publishedAt?: string;
  scheduledAt?: string;
  author: Author;
  category?: Category;
  tags: Tag[];
  collaborators?: Author[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  canonicalUrl?: string;
  ogImageUrl?: string;
  readingTime: number;
  viewCount: number;
  adEnabled: boolean;
  adSlots?: AdSlot[];
  createdAt: string;
  updatedAt: string;
}

export type ReactionType = 'ship_it' | 'mind_blown' | 'learned_something';

export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  reaction: ReactionType;
  createdAt: string;
}

export interface PostAnnotation {
  id: string;
  postId: string;
  userId: string;
  quote: string;
  comment: string;
  startOffset: number;
  endOffset: number;
  createdAt: string;
  updatedAt: string;
  author?: Author;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  author?: Pick<Author, "id" | "name" | "slug" | "avatarUrl">;
  replies?: PostComment[];
}

export interface AdSlot {
  id: string;
  name: string;
  location: "global" | "post" | "category" | "author";
  adClient: string;
  adSlot: string;
  responsive: boolean;
  width?: number;
  height?: number;
  isActive: boolean;
}

export interface PostCardProps {
  post: Post;
  variant?: "horizontal" | "vertical" | "featured";
  showCategory?: boolean;
  showAuthor?: boolean;
  showReadingTime?: boolean;
  className?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}
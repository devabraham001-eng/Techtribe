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
  publishedAt?: string;
  scheduledAt?: string;
  author: Author;
  category?: Category;
  tags: Tag[];
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
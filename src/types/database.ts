export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content_mdx: string;
          content_html: string | null;
          cover_image_url: string | null;
          cover_image_alt: string | null;
          status: "draft" | "review" | "scheduled" | "published" | "archived";
          visibility: "public" | "unlisted" | "private";
          published_at: string | null;
          scheduled_at: string | null;
          author_id: string | null;
          category_id: string | null;
          tags: string[];
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string[];
          canonical_url: string | null;
          og_image_url: string | null;
          reading_time: number;
          view_count: number;
          view_count_realtime: number;
          ad_enabled: boolean;
          is_featured: boolean;
          is_trending: boolean;
          post_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["posts"]["Row"], "id" | "created_at" | "updated_at" | "view_count" | "view_count_realtime">;
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          post_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at" | "updated_at" | "post_count">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          type: string;
          post_count: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tags"]["Row"], "id" | "created_at" | "post_count">;
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      authors: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          bio: string | null;
          avatar_url: string | null;
          twitter: string | null;
          github: string | null;
          linkedin: string | null;
          website: string | null;
          is_staff: boolean;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["authors"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["authors"]["Insert"]>;
      };
      post_views: {
        Row: {
          id: string;
          post_id: string;
          viewer_ip: string | null;
          user_agent: string | null;
          referer: string | null;
          viewer_id: string | null;
          viewed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["post_views"]["Row"], "id" | "viewed_at">;
        Update: never;
      };
      ad_slots: {
        Row: {
          id: string;
          name: string;
          location: string;
          ad_client: string | null;
          ad_slot: string | null;
          responsive: boolean;
          width: number | null;
          height: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ad_slots"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["ad_slots"]["Insert"]>;
      };
      post_reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          reaction: 'ship_it' | 'mind_blown' | 'learned_something';
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["post_reactions"]["Row"], "id" | "created_at">;
        Update: never;
      };
      post_annotations: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          quote: string;
          comment: string;
          start_offset: number;
          end_offset: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["post_annotations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Database["public"]["Tables"]["post_annotations"]["Row"], "id" | "created_at" | "post_id" | "user_id">>;
      };
      post_collaborators: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["post_collaborators"]["Row"], "id" | "created_at">;
        Update: never;
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["post_comments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Pick<Database["public"]["Tables"]["post_comments"]["Row"], "content">>;
      };
      learning_tracks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          slug: string;
          cover_image_url: string | null;
          category: string | null;
          lesson_count: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["learning_tracks"]["Row"], "id" | "created_at" | "lesson_count">;
        Update: Partial<Database["public"]["Tables"]["learning_tracks"]["Insert"]>;
      };
      track_modules: {
        Row: {
          id: string;
          track_id: string;
          title: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["track_modules"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["track_modules"]["Insert"]>;
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content: string | null;
          is_project: boolean;
          project_prompt: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lessons"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed_at: string;
          submitted_project_article_id: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["user_lesson_progress"]["Row"], "id" | "completed_at">;
        Update: Partial<Pick<Database["public"]["Tables"]["user_lesson_progress"]["Row"], "submitted_project_article_id">>;
      };
      page_views: {
        Row: {
          id: string;
          path: string;
          user_id: string | null;
          is_authenticated: boolean;
          hashed_ip: string | null;
          referrer: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["page_views"]["Row"], "id" | "created_at">;
        Update: never;
      };
    };
    Functions: {
      increment_post_views: {
        Args: { post_id: string };
        Returns: void;
      };
      calculate_reading_time: {
        Args: { content: string };
        Returns: number;
      };
    };
  };
}
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
-- Database schema for TechTribe Blog
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  color text,
  post_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tags
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  post_count int default 0,
  created_at timestamptz default now()
);

-- Authors
create table if not exists authors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  name text not null,
  slug text not null unique,
  bio text,
  avatar_url text,
  twitter text,
  github text,
  linkedin text,
  website text,
  is_staff boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Posts
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content_mdx text not null default '',
  content_html text,
  cover_image_url text,
  cover_image_alt text,
  status text not null default 'draft' check (status in ('draft', 'review', 'scheduled', 'published', 'archived')),
  visibility text not null default 'public' check (visibility in ('public', 'unlisted', 'private')),
  published_at timestamptz,
  scheduled_at timestamptz,
  author_id uuid references authors(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  tags uuid[] default '{}',
  seo_title text,
  seo_description text,
  seo_keywords text[],
  canonical_url text,
  og_image_url text,
  reading_time int default 0,
  view_count int default 0,
  view_count_realtime int default 0, -- for live counter
  ad_enabled boolean default true,
  is_featured boolean default false,
  is_trending boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ad slots
create table if not exists ad_slots (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  location text not null,
  ad_client text,
  ad_slot text,
  responsive boolean default true,
  width int,
  height int,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Post view logs (for real-time analytics)
create table if not exists post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  viewer_ip text,
  user_agent text,
  referer text,
  viewed_at timestamptz default now()
);

-- Indexes
create index if not exists idx_posts_published on posts(status, published_at desc) where status = 'published';
create index if not exists idx_posts_category on posts(category_id);
create index if not exists idx_posts_author on posts(author_id);
create index if not exists idx_posts_slug on posts(slug);
create index if not exists idx_posts_tags on posts using gin(tags);
create index if not exists idx_posts_featured on posts(is_featured) where is_featured = true;
create index if not exists idx_posts_trending on posts(view_count desc) where status = 'published';
create index if not exists idx_post_views_post on post_views(post_id);
create index if not exists idx_post_views_date on post_views(viewed_at);

-- Row Level Security
alter table categories enable row level security;
alter table tags enable row level security;
alter table authors enable row level security;
alter table posts enable row level security;
alter table ad_slots enable row level security;
alter table post_views enable row level security;

-- Public read access
create policy "Public read categories" on categories for select using (true);
create policy "Public read tags" on tags for select using (true);
create policy "Public read authors" on authors for select using (true);
create policy "Public read active ad slots" on ad_slots for select using (is_active = true);
create policy "Public read published posts" on posts for select using (status = 'published' and visibility = 'public');

create policy "Users create own author profile" on authors
  for insert with check (user_id = auth.uid());

create policy "Users update own author profile" on authors
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Authenticated insert for view tracking
create policy "Anyone can insert post views" on post_views for insert with check (true);

-- Authors can manage their own content
create policy "Authors manage own posts" on posts
  for all using (
    author_id in (select id from authors where user_id = auth.uid())
  )
  with check (
    author_id in (select id from authors where user_id = auth.uid())
  );

-- Create an author profile for each newly confirmed user
create or replace function handle_new_user()
returns trigger as $$
declare
  base_name text;
  base_slug text;
begin
  base_name := coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1), 'TechTribe Author');
  base_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);

  insert into public.authors (user_id, name, slug)
  values (
    new.id,
    base_name,
    base_slug || '-' || left(new.id::text, 8)
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Enable real-time subscriptions
alter publication supabase_realtime add table posts;
alter publication supabase_realtime add table post_views;

-- Function to increment view count
create or replace function increment_post_views(post_id uuid)
returns void as $$
begin
  update posts
  set view_count = view_count + 1,
      view_count_realtime = view_count_realtime + 1
  where id = post_id;
end;
$$ language plpgsql security definer;

-- Function to calculate reading time
create or replace function calculate_reading_time(content text)
returns int as $$
declare
  word_count int;
begin
  word_count := array_length(regexp_split_to_array(trim(content), '\s+'), 1);
  return greatest(1, ceil(word_count::numeric / 200.0))::int;
end;
$$ language plpgsql immutable;

-- Trigger to auto-set reading_time on insert/update
create or replace function set_reading_time()
returns trigger as $$
begin
  new.reading_time := calculate_reading_time(new.content_mdx);
  return new;
end;
$$ language plpgsql;

create trigger trg_set_reading_time
  before insert or update on posts
  for each row
  execute function set_reading_time();

-- Seed data
insert into categories (name, slug, description, icon) values
  ('Web Development', 'web-development', 'Frontend, backend, and full-stack development', '💻'),
  ('Career & Freelancing', 'career-freelancing', 'Career advice, freelancing tips, and growth', '💼'),
  ('Backend & DevOps', 'backend-devops', 'Server-side dev, infrastructure, deployment', '⚙️'),
  ('AI & Tools', 'ai-tools', 'AI tools and productivity for developers', '🤖'),
  ('Productivity', 'productivity', 'Workflow optimization and productivity hacks', '⚡')
on conflict (slug) do nothing;

insert into tags (name, slug) values
  ('React', 'react'), ('TypeScript', 'typescript'), ('Next.js', 'nextjs'),
  ('Freelancing', 'freelancing'), ('Career', 'career'), ('Docker', 'docker'),
  ('PostgreSQL', 'postgresql'), ('AI', 'ai'), ('Tailwind CSS', 'tailwind-css'),
  ('Performance', 'performance'), ('CSS', 'css'), ('Supabase', 'supabase'),
  ('DevOps', 'devops'), ('Productivity', 'productivity'), ('Tools', 'tools')
on conflict (slug) do nothing;

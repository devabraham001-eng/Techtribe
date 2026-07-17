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
  type text not null default 'general' check (type in ('tech', 'general')),
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
  status text check (status in ('open_to_work', 'hiring', 'mentoring', 'open_for_mentorship')),
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
  post_type text not null default 'article' check (post_type in ('article', 'project')),
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
  viewer_id uuid references auth.users(id) on delete set null,
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

-- Recreate app policies so this setup script can be rerun safely
drop policy if exists "Public read categories" on categories;
drop policy if exists "Public read tags" on tags;
drop policy if exists "Public read authors" on authors;
drop policy if exists "Public read active ad slots" on ad_slots;
drop policy if exists "Public read published posts" on posts;
drop policy if exists "Users create own author profile" on authors;
drop policy if exists "Users update own author profile" on authors;
drop policy if exists "Anyone can insert post views" on post_views;
drop policy if exists "Authors manage own posts" on posts;

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

create policy "Authors can read own post views" on post_views
  for select using (
    post_id in (
      select id from posts where author_id in (
        select id from authors where user_id = auth.uid()
      )
    )
  );

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
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table posts;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'post_views'
  ) then
    alter publication supabase_realtime add table post_views;
  end if;
end $$;

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

drop trigger if exists trg_set_reading_time on posts;
create trigger trg_set_reading_time
  before insert or update on posts
  for each row
  execute function set_reading_time();

-- Keep public category and tag counts in sync with published posts
create or replace function refresh_taxonomy_post_counts()
returns void as $$
begin
  update categories
  set post_count = coalesce(counts.total, 0),
      updated_at = now()
  from (
    select c.id, count(p.id)::int as total
    from categories c
    left join posts p
      on p.category_id = c.id
      and p.status = 'published'
      and p.visibility = 'public'
    group by c.id
  ) counts
  where categories.id = counts.id;

  update tags
  set post_count = coalesce(counts.total, 0)
  from (
    select t.id, count(p.id)::int as total
    from tags t
    left join posts p
      on t.id = any(p.tags)
      and p.status = 'published'
      and p.visibility = 'public'
    group by t.id
  ) counts
  where tags.id = counts.id;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function refresh_taxonomy_post_counts_trigger()
returns trigger as $$
begin
  perform refresh_taxonomy_post_counts();
  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_refresh_taxonomy_post_counts on posts;
create trigger trg_refresh_taxonomy_post_counts
  after insert or update or delete on posts
  for each statement
  execute function refresh_taxonomy_post_counts_trigger();

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

select refresh_taxonomy_post_counts();

-- Public storage buckets used by avatar and post cover uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'post-covers',
    'post-covers',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS: authenticated users can upload to post-covers and avatars
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Public read storage objects" on storage.objects;
drop policy if exists "Users can update own storage objects" on storage.objects;
drop policy if exists "Users can delete own storage objects" on storage.objects;

create policy "Authenticated users can upload images"
on storage.objects for insert
with check (
  bucket_id in ('post-covers', 'avatars')
  and auth.role() = 'authenticated'
);

create policy "Public read storage objects"
on storage.objects for select
using (bucket_id in ('post-covers', 'avatars'));

create policy "Users can update own storage objects"
on storage.objects for update
using (bucket_id in ('post-covers', 'avatars') and auth.uid() = owner)
with check (bucket_id in ('post-covers', 'avatars') and auth.uid() = owner);

create policy "Users can delete own storage objects"
on storage.objects for delete
using (bucket_id in ('post-covers', 'avatars') and auth.uid() = owner);

-- =============================================
-- Phase 1 Migrations: Add new columns to existing tables
-- Run these if updating an existing database
-- =============================================

-- Add type column to tags
alter table if exists tags add column if not exists type text not null default 'general' check (type in ('tech', 'general'));

-- Update existing tags: mark tech tags
update tags set type = 'tech' where slug in ('react', 'typescript', 'nextjs', 'docker', 'postgresql', 'ai', 'tailwind-css', 'supabase', 'css', 'devops');

-- Add status column to authors
alter table if exists authors add column if not exists status text check (status in ('open_to_work', 'hiring', 'mentoring', 'open_for_mentorship'));

-- Add post_type column to posts
alter table if exists posts add column if not exists post_type text not null default 'article' check (post_type in ('article', 'project'));

-- =============================================
-- Phase 3: Social & Collaboration Tables
-- =============================================

-- Post reactions (Ship It, Mind Blown, Learned Something)
create table if not exists post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('ship_it', 'mind_blown', 'learned_something')),
  created_at timestamptz default now(),
  unique(post_id, user_id, reaction)
);

-- Inline annotations (highlight + comment on specific text)
create table if not exists post_annotations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  quote text not null,
  comment text not null,
  start_offset int not null,
  end_offset int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Post collaborators (tag co-creators)
create table if not exists post_collaborators (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_id uuid not null references authors(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, author_id)
);

-- Indexes
create index if not exists idx_post_reactions_post on post_reactions(post_id);
create index if not exists idx_post_reactions_user on post_reactions(user_id);
create index if not exists idx_post_annotations_post on post_annotations(post_id);
create index if not exists idx_post_collaborators_post on post_collaborators(post_id);

-- RLS
alter table post_reactions enable row level security;
alter table post_annotations enable row level security;
alter table post_collaborators enable row level security;

-- Policies: anyone can read reactions/annotations/collaborators
drop policy if exists "Public read post_reactions" on post_reactions;
create policy "Public read post_reactions" on post_reactions for select using (true);

drop policy if exists "Public read post_annotations" on post_annotations;
create policy "Public read post_annotations" on post_annotations for select using (true);

drop policy if exists "Public read post_collaborators" on post_collaborators;
create policy "Public read post_collaborators" on post_collaborators for select using (true);

-- Authenticated users can insert/update/delete their own reactions
drop policy if exists "Users manage own reactions" on post_reactions;
create policy "Users manage own reactions" on post_reactions
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Authenticated users can insert/update/delete their own annotations
drop policy if exists "Users manage own annotations" on post_annotations;
create policy "Users manage own annotations" on post_annotations
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Authenticated users can manage collaborators on their own posts
drop policy if exists "Authors manage own post collaborators" on post_collaborators;
create policy "Authors manage own post collaborators" on post_collaborators
  for all using (
    post_id in (
      select id from posts where author_id in (
        select id from authors where user_id = auth.uid()
      )
    )
  )
  with check (
    post_id in (
      select id from posts where author_id in (
        select id from authors where user_id = auth.uid()
      )
    )
  );

-- Run this in your Supabase SQL editor

create extension if not exists "uuid-ossp";

-- Users (one row per auth.user, created on onboarding)
create table public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  handle          text unique not null check (handle ~ '^[a-z0-9_]{2,20}$'),
  name            text not null,
  school          text,
  avatar_initials text not null default 'XX',
  created_at      timestamptz default now()
);
alter table public.users enable row level security;
create policy "users: read all"  on public.users for select using (true);
create policy "users: write own" on public.users for all   using (auth.uid() = id);

-- Content type
create type content_type_enum as enum ('chat', 'image', 'voice', 'doc');

-- Posts
create table public.posts (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.users(id) on delete cascade,
  content_type   content_type_enum not null default 'chat',
  x_description  text not null,
  moments        jsonb not null default '[]'::jsonb,
  artifact_url   text,
  created_at     timestamptz default now()
);
create index posts_user_id_idx    on public.posts(user_id);
create index posts_created_at_idx on public.posts(created_at desc);
alter table public.posts enable row level security;
create policy "posts: read all"   on public.posts for select using (true);
create policy "posts: insert own" on public.posts for insert with check (auth.uid() = user_id);
create policy "posts: delete own" on public.posts for delete using (auth.uid() = user_id);

-- Likes
create table public.likes (
  id       uuid primary key default uuid_generate_v4(),
  user_id  uuid not null references public.users(id) on delete cascade,
  post_id  uuid not null references public.posts(id) on delete cascade,
  unique(user_id, post_id)
);
create index likes_post_id_idx on public.likes(post_id);
alter table public.likes enable row level security;
create policy "likes: read all"   on public.likes for select using (true);
create policy "likes: insert own" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes: delete own" on public.likes for delete using (auth.uid() = user_id);

-- Replies (both sides are posts)
create table public.replies (
  id             uuid primary key default uuid_generate_v4(),
  parent_post_id uuid not null references public.posts(id) on delete cascade,
  reply_post_id  uuid not null references public.posts(id) on delete cascade,
  created_at     timestamptz default now(),
  unique(parent_post_id, reply_post_id)
);
create index replies_parent_idx on public.replies(parent_post_id);
alter table public.replies enable row level security;
create policy "replies: read all"   on public.replies for select using (true);
create policy "replies: insert own" on public.replies for insert with check (
  exists (select 1 from public.posts where id = reply_post_id and user_id = auth.uid())
);

-- Denormalized feed view (used by all list queries)
create or replace view public.feed_posts as
  select
    p.id, p.user_id, p.content_type, p.x_description,
    p.moments, p.artifact_url, p.created_at,
    u.handle, u.name, u.avatar_initials, u.school,
    count(distinct l.id)::int as like_count,
    count(distinct r.id)::int as reply_count
  from public.posts p
  join public.users u on u.id = p.user_id
  left join public.likes l on l.post_id = p.id
  left join public.replies r on r.parent_post_id = p.id
  group by p.id, u.id;

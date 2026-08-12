create table if not exists public.product_questions (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null check (char_length(product_slug) between 1 and 120),
  user_id uuid not null references auth.users(id) on delete cascade,
  author text not null check (char_length(author) between 1 and 20),
  title text not null check (char_length(title) between 2 and 80),
  content text not null check (char_length(content) between 5 and 1000),
  is_private boolean not null default false,
  answer text check (answer is null or char_length(answer) between 1 and 2000),
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_questions_product_created_idx on public.product_questions (product_slug, created_at desc);
create index if not exists product_questions_user_idx on public.product_questions (user_id);
alter table public.product_questions enable row level security;

revoke all on table public.product_questions from public, anon, authenticated;
grant select on table public.product_questions to anon, authenticated;
grant insert (product_slug, user_id, author, title, content, is_private) on table public.product_questions to authenticated;
grant update (author, title, content, is_private, updated_at) on table public.product_questions to authenticated;
grant delete on table public.product_questions to authenticated;

create policy "Public questions and own private questions are readable" on public.product_questions
  for select to anon, authenticated
  using (is_private = false or ((select auth.uid()) is not null and (select auth.uid()) = user_id));

create policy "Users can create their own product questions" on public.product_questions
  for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can update their own product questions" on public.product_questions
  for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can delete their own product questions" on public.product_questions
  for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

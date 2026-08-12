create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null check (char_length(product_slug) between 1 and 120),
  user_id uuid not null references auth.users(id) on delete cascade,
  author text not null check (char_length(author) between 1 and 20),
  rating smallint not null check (rating between 1 and 5),
  content text not null check (char_length(content) between 5 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_reviews_product_created_idx on public.product_reviews (product_slug, created_at desc);
create index if not exists product_reviews_user_idx on public.product_reviews (user_id);
alter table public.product_reviews enable row level security;

grant select on table public.product_reviews to anon, authenticated;
grant insert, update, delete on table public.product_reviews to authenticated;
revoke all on table public.product_reviews from public;

create policy "Product reviews are publicly readable" on public.product_reviews for select to anon, authenticated using (true);
create policy "Users can create their own product reviews" on public.product_reviews for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own product reviews" on public.product_reviews for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their own product reviews" on public.product_reviews for delete to authenticated using ((select auth.uid()) = user_id);
.review-login-prompt { 50676
.review-login-prompt button { 51108

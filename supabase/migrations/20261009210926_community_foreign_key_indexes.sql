-- Cover user foreign keys for account-deletion cascades and member lookups.
-- No data, access grants or retention behavior is changed.
create index article_likes_user_id_idx on public.article_likes (user_id);
create index comments_author_id_idx on public.comments (author_id);
create index comment_reports_reporter_id_idx on public.comment_reports (reporter_id);

-- sqlite/047_newsletter_seen.sql 과 같은 내용 (까닭은 그쪽 주석 참고)
INSERT INTO site_settings (key, value, updated_at)
  VALUES ('newsletter_seen_at',
          to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'),
          to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS'))
  ON CONFLICT (key) DO NOTHING;

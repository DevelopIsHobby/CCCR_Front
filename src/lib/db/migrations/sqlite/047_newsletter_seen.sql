-- 뉴스레터 새 구독 알림의 기준 시각(lib/db/newsletter.ts countNewSubscribers).
-- 관리자가 구독자 화면을 마지막으로 연 때다. 처음에는 지금으로 두어 이미 있던 구독자로 알림이 뜨지 않게 한다.
-- 시각은 앱이 쓰는 꼴(UTC 'YYYY-MM-DD HH:MM:SS')과 같다. 이미 있으면 넘어간다.
INSERT INTO site_settings (key, value, updated_at)
  VALUES ('newsletter_seen_at', strftime('%Y-%m-%d %H:%M:%S', 'now'), strftime('%Y-%m-%d %H:%M:%S', 'now'))
  ON CONFLICT (key) DO NOTHING;

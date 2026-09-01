-- 뉴스레터 구독자.
CREATE TABLE newsletter_subscribers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    NOT NULL UNIQUE,
  status     TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  -- 어디서 신청했는지 (메인 띠 · 뉴스레터 화면 · 회원가입)
  source     TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status, id);

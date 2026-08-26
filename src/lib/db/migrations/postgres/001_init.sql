-- sqlite/001_init.sql 과 같은 구조의 PostgreSQL 판.
-- 시각은 앱이 'YYYY-MM-DD HH:MM:SS'(UTC) 문자열로 넣으므로 TEXT 로 둔다.
-- 두 방언에서 표시·정렬 결과가 완전히 같도록 맞춘 것이다.

-- 회원 · 관리자
CREATE TABLE users (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         TEXT     NOT NULL UNIQUE,
  password_hash TEXT     NOT NULL,
  name          TEXT     NOT NULL,
  company       TEXT,
  phone         TEXT,
  role          TEXT     NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status        TEXT     NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'blocked')),
  created_at    TEXT     NOT NULL
);

-- 로그인 세션. 쿠키에는 원문 토큰, DB 에는 해시만 저장한다.
CREATE TABLE sessions (
  token_hash TEXT     PRIMARY KEY,
  user_id    INTEGER  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT     NOT NULL,
  created_at TEXT     NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- 게시판 종류 (공지사항 · 행사정보 · 자료실 …)
CREATE TABLE boards (
  slug       TEXT    PRIMARY KEY,
  name       TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 게시글
CREATE TABLE posts (
  id          INTEGER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  board       TEXT     NOT NULL REFERENCES boards(slug),
  title       TEXT     NOT NULL,
  body        TEXT     NOT NULL DEFAULT '',
  author_id   INTEGER  REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT     NOT NULL DEFAULT '최고관리자',
  is_pinned   SMALLINT NOT NULL DEFAULT 0 CHECK (is_pinned IN (0, 1)),
  is_locked   SMALLINT NOT NULL DEFAULT 0 CHECK (is_locked IN (0, 1)),
  views       INTEGER  NOT NULL DEFAULT 0,
  created_at  TEXT     NOT NULL,
  updated_at  TEXT     NOT NULL
);
CREATE INDEX idx_posts_board ON posts(board, is_pinned DESC, created_at DESC, id DESC);

-- 첨부파일. 실제 파일은 uploads 디렉터리에 stored_name 으로 저장한다.
CREATE TABLE attachments (
  id          INTEGER  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id     INTEGER  NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  filename    TEXT     NOT NULL,
  stored_name TEXT     NOT NULL UNIQUE,
  byte_size   INTEGER  NOT NULL,
  mime_type   TEXT     NOT NULL DEFAULT 'application/octet-stream',
  created_at  TEXT     NOT NULL
);
CREATE INDEX idx_attachments_post ON attachments(post_id);

INSERT INTO boards (slug, name, sort_order) VALUES
  ('notice', '공지사항', 1),
  ('events', '행사정보', 2);

-- 본문에 넣는 이미지. 글보다 먼저 올라가므로 게시글과 묶지 않는다.
CREATE TABLE images (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  filename    TEXT    NOT NULL,
  stored_name TEXT    NOT NULL UNIQUE,
  byte_size   INTEGER NOT NULL,
  mime_type   TEXT    NOT NULL,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TEXT    NOT NULL
);

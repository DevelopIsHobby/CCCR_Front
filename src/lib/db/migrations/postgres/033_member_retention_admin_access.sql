-- sqlite/033_member_retention_admin_access.sql 과 같은 내용 (까닭은 그쪽 주석 참고)
ALTER TABLE users ADD COLUMN status_changed_at TEXT NOT NULL DEFAULT '';

CREATE TABLE admin_access_log (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email      TEXT    NOT NULL,
  ip         TEXT    NOT NULL DEFAULT '',
  action     TEXT    NOT NULL,
  target     TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL
);
CREATE INDEX idx_admin_access_log_created ON admin_access_log(created_at);

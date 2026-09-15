-- sqlite/032_social_login.sql 과 같은 내용 (까닭은 그쪽 주석 참고)
CREATE TABLE user_identities (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider   TEXT    NOT NULL CHECK (provider IN ('google', 'kakao', 'naver')),
  subject    TEXT    NOT NULL,
  email      TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL,
  UNIQUE (provider, subject)
);
CREATE INDEX idx_user_identities_user ON user_identities(user_id);

CREATE TABLE oauth_signups (
  token_hash     TEXT    PRIMARY KEY,
  provider       TEXT    NOT NULL,
  subject        TEXT    NOT NULL,
  email          TEXT    NOT NULL DEFAULT '',
  email_verified INTEGER NOT NULL DEFAULT 0,
  name           TEXT    NOT NULL DEFAULT '',
  completed      INTEGER NOT NULL DEFAULT 0,
  expires_at     TEXT    NOT NULL,
  created_at     TEXT    NOT NULL
);

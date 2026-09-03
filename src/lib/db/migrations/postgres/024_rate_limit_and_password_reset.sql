-- sqlite/024_rate_limit_and_password_reset.sql 과 같은 내용
-- 횟수 제한 기록.
-- 로그인 시도와 신청 접수를 같은 표에 담는다. scope 로 갈라 쓴다.
-- key 는 이메일이나 IP 처럼 '누구를 세는가'를 나타내는 값이다.
CREATE TABLE rate_events (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope      TEXT NOT NULL,
  key        TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_rate_events_lookup ON rate_events(scope, key, created_at);

-- 비밀번호 재설정 링크.
-- 토큰은 그대로 두지 않고 해시만 담는다. 표를 들여다봐도 링크를 못 만들게 한다.
CREATE TABLE password_resets (
  token_hash TEXT NOT NULL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  -- 한 번 쓰면 다시 못 쓰게 시각을 남긴다
  used_at    TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX idx_password_resets_user ON password_resets(user_id);

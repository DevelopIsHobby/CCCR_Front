-- 소셜 로그인(카카오·네이버·구글).
--
-- user_identities: 어느 서비스의 어떤 회원이 우리 회원 누구인지. 한 회원이 여러 서비스를 이을 수 있다.
--   서비스가 주는 회원 식별값(subject)은 이메일과 달리 바뀌지 않으므로 이것으로 찾는다.
-- oauth_signups: 소셜로 처음 온 사람이 소속·동의를 적는 동안만 두는 임시 기록(30분).
--   쿠키에는 원문 토큰, 여기에는 해시만 둔다. 가입을 마치면 completed 를 1 로 바꿔
--   화면을 새로 그려도 '접수되었습니다'가 그대로 보이게 하고, 기한이 지나면 야간 정리가 지운다.
--
-- 소셜로만 가입한 회원은 users.password_hash 가 빈 값이다. 빈 값은 비밀번호 확인을 통과하지
-- 못하므로 비밀번호로는 들어올 수 없고, 필요하면 '비밀번호 찾기'로 새로 만든다.
CREATE TABLE user_identities (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
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

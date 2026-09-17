-- 개인정보 보유 기간과 관리자 접속 기록.
--
-- users.status_changed_at: 승인·이용 제한 등 상태를 바꾼 때. 개인정보 처리방침 제3조에
--   "승인 대기 6개월", "이용 제한 1년"을 적었으므로 그 기간을 셀 기준이 필요하다.
--   빈 값이면(이 칸이 생기기 전 계정) 가입일(created_at)부터 센다.
--
-- admin_access_log: 「개인정보의 안전성 확보조치 기준」 제8조 — 개인정보를 다루는 사람(관리자)이
--   개인정보처리시스템에 접속한 기록을 1년 이상 보관하고 월 1회 이상 점검해야 한다.
--   계정은 지워져도 기록은 남아야 하므로 user_id 와 함께 이메일을 따로 적는다.
--   action: 조회 · 내려받기 · 처리 · 점검
ALTER TABLE users ADD COLUMN status_changed_at TEXT NOT NULL DEFAULT '';

CREATE TABLE admin_access_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email      TEXT    NOT NULL,
  ip         TEXT    NOT NULL DEFAULT '',
  action     TEXT    NOT NULL,
  target     TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL
);
CREATE INDEX idx_admin_access_log_created ON admin_access_log(created_at);

-- sqlite/022_request_tracking.sql 과 같은 내용
-- 신청자에게 접수·결과를 알리고, 신청자가 스스로 현황을 확인할 수 있게 한다.
--
-- 로그인을 강제하지 않기로 했으므로 "이 신청이 당신 것"임을 증명할 것이 필요하다.
--   ref          사람이 부르고 적는 접수번호. 메일·전화 문의에 쓴다. (예: RM-260903-0042)
--   lookup_token 주소창에 붙는 추측 불가능한 값. 메일의 조회 링크에 넣는다.
-- 로그인 사용자는 이메일이 같은 신청을 모아 보므로 토큰 없이도 볼 수 있다.

ALTER TABLE notice_subscribers   ADD COLUMN ref TEXT NOT NULL DEFAULT '';
ALTER TABLE notice_subscribers   ADD COLUMN lookup_token TEXT NOT NULL DEFAULT '';
ALTER TABLE education_proposals  ADD COLUMN ref TEXT NOT NULL DEFAULT '';
ALTER TABLE education_proposals  ADD COLUMN lookup_token TEXT NOT NULL DEFAULT '';
ALTER TABLE room_reservations    ADD COLUMN ref TEXT NOT NULL DEFAULT '';
ALTER TABLE room_reservations    ADD COLUMN lookup_token TEXT NOT NULL DEFAULT '';
ALTER TABLE promo_requests       ADD COLUMN ref TEXT NOT NULL DEFAULT '';
ALTER TABLE promo_requests       ADD COLUMN lookup_token TEXT NOT NULL DEFAULT '';

-- 지금 있는 신청에 접수번호를 매긴다. 날짜는 접수일, 뒤 네 자리는 id 를 쓴다.
UPDATE notice_subscribers
   SET ref = 'NT-' || REPLACE(SUBSTR(created_at, 3, 8), '-', '') || '-' || LPAD(id::text, 4, '0'),
       lookup_token = MD5(RANDOM()::text || id::text || clock_timestamp()::text)
 WHERE ref = '';
UPDATE education_proposals
   SET ref = 'ED-' || REPLACE(SUBSTR(created_at, 3, 8), '-', '') || '-' || LPAD(id::text, 4, '0'),
       lookup_token = MD5(RANDOM()::text || id::text || clock_timestamp()::text)
 WHERE ref = '';
UPDATE room_reservations
   SET ref = 'RM-' || REPLACE(SUBSTR(created_at, 3, 8), '-', '') || '-' || LPAD(id::text, 4, '0'),
       lookup_token = MD5(RANDOM()::text || id::text || clock_timestamp()::text)
 WHERE ref = '';
UPDATE promo_requests
   SET ref = 'PR-' || REPLACE(SUBSTR(created_at, 3, 8), '-', '') || '-' || LPAD(id::text, 4, '0'),
       lookup_token = MD5(RANDOM()::text || id::text || clock_timestamp()::text)
 WHERE ref = '';

CREATE UNIQUE INDEX idx_notice_subscribers_token  ON notice_subscribers(lookup_token);
CREATE UNIQUE INDEX idx_education_proposals_token ON education_proposals(lookup_token);
CREATE UNIQUE INDEX idx_room_reservations_token   ON room_reservations(lookup_token);
CREATE UNIQUE INDEX idx_promo_requests_token      ON promo_requests(lookup_token);

CREATE INDEX idx_notice_subscribers_email  ON notice_subscribers(email);
CREATE INDEX idx_education_proposals_email ON education_proposals(email);
CREATE INDEX idx_room_reservations_email   ON room_reservations(email);
CREATE INDEX idx_promo_requests_email      ON promo_requests(email);

-- 보낸 메일 기록.
-- "안 왔다"는 문의가 들어왔을 때 보냈는지 못 보냈는지를 사무국이 확인할 수 있어야 한다.
-- 본문은 남기지 않는다. 누구에게 무엇을 언제 보냈는지만 남긴다.
CREATE TABLE mail_log (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind       TEXT    NOT NULL,
  ref        TEXT    NOT NULL DEFAULT '',
  to_email   TEXT    NOT NULL,
  subject    TEXT    NOT NULL,
  status     TEXT    NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error      TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL
);
CREATE INDEX idx_mail_log_ref ON mail_log(ref, id);
CREATE INDEX idx_mail_log_created ON mail_log(created_at, id);

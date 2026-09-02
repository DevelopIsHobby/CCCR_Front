-- sqlite/021_notice_approval_and_room_blocks.sql 과 같은 내용
-- 사업공고는 임원사에게만 보내는 것이 원칙이라, 신청을 받았다고 바로 보내면 안 된다.
-- 승인 대기(pending)와 반려(rejected)를 상태에 더한다.
-- PostgreSQL 은 CHECK 이름이 <표>_<칸>_check 로 정해지므로 그것만 바꿔 끼운다.
ALTER TABLE notice_subscribers DROP CONSTRAINT notice_subscribers_status_check;
ALTER TABLE notice_subscribers
  ADD CONSTRAINT notice_subscribers_status_check
  CHECK (status IN ('pending', 'active', 'rejected', 'unsubscribed'));
ALTER TABLE notice_subscribers ALTER COLUMN status SET DEFAULT 'pending';

-- 반려 사유. 사무국이 남기면 신청자에게 그대로 알려 줄 수 있다.
ALTER TABLE notice_subscribers ADD COLUMN note TEXT NOT NULL DEFAULT '';

-- 조합이 회의실을 직접 쓰는 시간. 예약이 없어도 이 시간은 빌려줄 수 없다.
CREATE TABLE room_blocks (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room       TEXT    NOT NULL,
  use_date   TEXT    NOT NULL,
  start_time TEXT    NOT NULL,
  end_time   TEXT    NOT NULL,
  memo       TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL
);
CREATE INDEX idx_room_blocks_slot ON room_blocks(room, use_date, start_time);

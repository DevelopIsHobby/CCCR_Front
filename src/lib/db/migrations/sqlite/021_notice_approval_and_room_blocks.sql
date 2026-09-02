-- 사업공고는 임원사에게만 보내는 것이 원칙이라, 신청을 받았다고 바로 보내면 안 된다.
-- 승인 대기(pending)와 반려(rejected)를 상태에 더한다.
-- SQLite 는 CHECK 를 고칠 수 없어 표를 새로 만들고 옮긴다.
CREATE TABLE notice_subscribers_new (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  company    TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL UNIQUE,
  tel        TEXT    NOT NULL DEFAULT '',
  status     TEXT    NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending', 'active', 'rejected', 'unsubscribed')),
  -- 반려 사유. 사무국이 남기면 신청자에게 그대로 알려 줄 수 있다.
  note       TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);

-- 이미 받고 있던 사람은 그대로 둔다. 다시 승인받게 하면 안 된다.
INSERT INTO notice_subscribers_new (id, company, name, email, tel, status, created_at, updated_at)
  SELECT id, company, name, email, tel, status, created_at, updated_at FROM notice_subscribers;

DROP TABLE notice_subscribers;
ALTER TABLE notice_subscribers_new RENAME TO notice_subscribers;
CREATE INDEX idx_notice_subscribers_status ON notice_subscribers(status, id);

-- 조합이 회의실을 직접 쓰는 시간. 예약이 없어도 이 시간은 빌려줄 수 없다.
CREATE TABLE room_blocks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  room       TEXT    NOT NULL,
  use_date   TEXT    NOT NULL,
  start_time TEXT    NOT NULL,
  end_time   TEXT    NOT NULL,
  memo       TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL
);
CREATE INDEX idx_room_blocks_slot ON room_blocks(room, use_date, start_time);

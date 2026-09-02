-- 회의실 대여 예약.
-- 조합이 대회의실·소회의실을 빌려주고 있어 신청을 받는다.
-- 사무국이 확정을 눌러야 예약이 잡히고, 확정·요청 중인 시간과 겹치면 신청이 막힌다.
CREATE TABLE room_reservations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  room       TEXT    NOT NULL,
  use_date   TEXT    NOT NULL,
  start_time TEXT    NOT NULL,
  end_time   TEXT    NOT NULL,
  headcount  INTEGER NOT NULL DEFAULT 0,
  org        TEXT    NOT NULL,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  tel        TEXT    NOT NULL DEFAULT '',
  purpose    TEXT    NOT NULL DEFAULT '',
  status     TEXT    NOT NULL DEFAULT 'requested'
             CHECK (status IN ('requested', 'confirmed', 'cancelled')),
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);
CREATE INDEX idx_room_reservations_slot ON room_reservations(room, use_date, start_time);

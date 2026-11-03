-- sqlite/044_calendar.sql 과 같은 내용 (까닭은 그쪽 주석 참고)
CREATE TABLE calendar_events (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title      TEXT    NOT NULL,
  starts_on  TEXT    NOT NULL,
  ends_on    TEXT    NOT NULL,
  href       TEXT    NOT NULL DEFAULT '',
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);
CREATE INDEX idx_calendar_events_dates ON calendar_events(starts_on, ends_on);

CREATE TABLE calendar_hidden (
  item_key   TEXT NOT NULL PRIMARY KEY,
  created_at TEXT NOT NULL
);

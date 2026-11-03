-- 메인 '일정 달력'을 관리자 화면(달력 일정)에서 고친다.
--
-- 달력은 행사정보(행사일)·사업공고(마감일)·교육 과정(교육 기간)에서 저절로 채워진다.
-- 여기에 셋을 더한다.
--   calendar_events  게시글이 없는 일정(정기총회·이사회·휴무 등)을 사무국이 직접 넣는다.
--                    날짜는 'YYYY-MM-DD'(한국 시각). 하루짜리는 시작일 = 종료일.
--   calendar_hidden  글은 그대로 두고 달력에서만 뺄 일정. 달력 항목 이름(item_key)을 적는다.
--                    'events-12', 'announce-5', 'course-3', 'custom-1' 꼴(lib/db/calendar.ts).
-- 종류별 켜고 끄기는 site_settings 의 calendar_off_kinds(쉼표로 이은 종류 이름)에 둔다.
CREATE TABLE calendar_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
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

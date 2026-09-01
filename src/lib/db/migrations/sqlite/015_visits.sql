-- 접속 기록. 하루치 방문자 수와 많이 본 화면을 세는 데만 쓴다.
-- visitor 는 그날 하루만 쓰는 해시라 사람을 되짚을 수 없고 날짜가 바뀌면 값도 바뀐다.
CREATE TABLE visits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  day        TEXT NOT NULL,
  path       TEXT NOT NULL,
  visitor    TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_visits_day ON visits(day);
CREATE INDEX idx_visits_day_path ON visits(day, path);
CREATE INDEX idx_visits_day_visitor ON visits(day, visitor);

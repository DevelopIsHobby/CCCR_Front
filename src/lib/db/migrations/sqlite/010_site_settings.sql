-- 사이트 기본 정보(푸터 표기). 키-값 한 줄씩 둔다.
CREATE TABLE site_settings (
  key        TEXT NOT NULL PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

INSERT INTO site_settings (key, value, updated_at) VALUES
  ('address', '서울특별시 강남구 삼성로86길 11, 거봉INC빌딩 5층', '2026-09-01 00:00:00'),
  ('tel', '02-2052-0156', '2026-09-01 00:00:00'),
  ('fax', '02-2052-0158', '2026-09-01 00:00:00'),
  ('email', 'admin@cccr.or.kr', '2026-09-01 00:00:00'),
  ('businessNo', '000-00-00000', '2026-09-01 00:00:00'),
  ('chairman', '이동기', '2026-09-01 00:00:00');

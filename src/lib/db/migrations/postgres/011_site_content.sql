-- sqlite/011_site_content.sql 과 같은 내용
-- 관련기관 바로가기 (푸터)
CREATE TABLE related_sites (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT    NOT NULL,
  url        TEXT    NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible SMALLINT NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);

-- 지금 푸터에 있는 기관명을 옮긴다. 주소는 받지 못해 비워 두고,
-- 주소가 없는 기관은 화면에 나오지 않는다(관리자 화면에서 채운다).
INSERT INTO related_sites (name, url, sort_order, created_at, updated_at) VALUES
  ('과학기술정보통신부', '', 1, '2026-09-01 00:00:00', '2026-09-01 00:00:00'),
  ('산업통상자원부', '', 2, '2026-09-01 00:00:00', '2026-09-01 00:00:00'),
  ('정보통신산업진흥원', '', 3, '2026-09-01 00:00:00', '2026-09-01 00:00:00'),
  ('한국산업기술평가관리원', '', 4, '2026-09-01 00:00:00', '2026-09-01 00:00:00'),
  ('한국클라우드산업협회', '', 5, '2026-09-01 00:00:00', '2026-09-01 00:00:00');

-- 사무실(찾아오시는 길)
CREATE TABLE offices (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT    NOT NULL,
  address    TEXT    NOT NULL DEFAULT '',
  tel        TEXT    NOT NULL DEFAULT '',
  fax        TEXT    NOT NULL DEFAULT '',
  note       TEXT    NOT NULL DEFAULT '',
  -- 교통편은 줄글로 둔다. 그룹 이름은 한 줄, 항목은 "배지 | 내용".
  transit    TEXT    NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible SMALLINT NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);

INSERT INTO offices (name, address, tel, fax, note, transit, sort_order, created_at, updated_at) VALUES
  ('삼성 사무실', '강남구 삼성로86길 11, 거봉INC빌딩 5층', '02-2052-0156', '02-2052-0158', '삼성역 4번 출구에서 포스코사거리 방향으로 약 600m 직진 – 도보 10분거리', '시내버스
B | 파랑(간선) 360번 (한국무역센터, 삼성역 하차)
G | 초록(지선) 3411번, 2416번 (한국무역센터, 삼성역 하차)

지하철
3,7 | 지하철 3호선 탑승 (강남고속터미널) → 교대역에서 2호선으로 환승 → 삼성역 하차(4번출구)
2 | 지하철 2호선 탑승 (강변역) → 삼성역 하차(4번출구)
3 | 지하철 3호선 탑승 (남부시외버스터미널역) → 교대역에서 2호선으로 환승 → 2호선 삼성역 하차(4번출구)

기차 이용시
1 | 지하철 1호선 탑승(영등포역) → 신도림역에서 2호선으로 환승 → 2호선 삼성역 하차(4번출구)
4 | 지하철 4호선 탑승(서울역) → 사당역에서 2호선으로 환승 → 2호선 삼성역 하차(4번출구)', 1, '2026-09-01 00:00:00', '2026-09-01 00:00:00'),
  ('구로 교육장(CCCR 아카데미)', '서울특별시 구로구 디지털로33길 50 벽산디지털밸리7차 2층, 14층', '02-3644-7355', '02-3644-7351', '구로디지털단지역 3번 출구에서 대림 방향으로 약 900m – 도보 15분거리', '시내버스
G | 초록(지선) 5616번 (디지털산업1단지 정류장 하처)
G | 초록(마을버스) 구로09번 (에이스테크노타워 정류장 하차)

지하철
2 | 지하철 2호선 탑승 (강변역) → 구로디지털단지역 하차(3번출구)
7 | 지하철 7호선 탑승 (강남고속터미널) → 남구로역 하차(1번출구)

기차 이용시
1 | 지하철 1호선 탑승 (서울역/용산역/영등포역) → 신도림역에서 2호선으로 환승 → 2호선 구로디지털단지역 하차(3번출구)', 2, '2026-09-01 00:00:00', '2026-09-01 00:00:00');

-- 회원사 가입안내의 입금계좌·문의처도 사이트 정보로 옮긴다.
INSERT INTO site_settings (key, value, updated_at) VALUES
  ('joinBank', '우리은행 1005-901-454240', '2026-09-01 00:00:00'),
  ('joinHolder', '한국클라우드컴퓨팅연구조합', '2026-09-01 00:00:00'),
  ('joinTeam', '한국클라우드컴퓨팅연구조합 조합회원 입회 담당자', '2026-09-01 00:00:00'),
  ('joinAddress', '서울특별시 강남구 삼성로86길 11, 거봉INC빌딩 5층', '2026-09-01 00:00:00'),
  ('joinTel', '02-2052-0156', '2026-09-01 00:00:00'),
  ('joinFax', '02-2052-0158', '2026-09-01 00:00:00'),
  ('joinEmail', 'admin@cccr.or.kr', '2026-09-01 00:00:00');

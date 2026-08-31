-- sqlite/007_home_cards.sql 과 같은 내용
-- 메인 화면에서 사무국이 직접 고치는 항목: 히어로 슬라이드 · 배너 띠 · 알림판.
-- 종류마다 쓰는 칸이 달라 한 표에 모으고 안 쓰는 칸은 비워 둔다.
CREATE TABLE home_cards (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind       TEXT    NOT NULL CHECK (kind IN ('slide', 'banner', 'promo')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  label      TEXT    NOT NULL DEFAULT '',   -- 슬라이드 눈썹 / 배너 분류 / 알림판 태그
  title      TEXT    NOT NULL,
  body       TEXT    NOT NULL DEFAULT '',   -- 슬라이드 본문 / 배너 부제 / 알림판 설명
  caption    TEXT,                          -- 슬라이드 하단 캡션
  date_text  TEXT,                          -- 슬라이드 날짜 표기
  href       TEXT    NOT NULL DEFAULT '',
  is_visible SMALLINT NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);
CREATE INDEX idx_home_cards_kind ON home_cards(kind, sort_order, id);

-- 지금 화면에 있는 내용을 그대로 옮겨 둔다.
-- 슬라이드 2·3번과 배너·알림판 문구는 화면 구성을 위한 자리표시자이므로
-- 관리자 화면에서 실제 내용으로 바꾼다.
INSERT INTO home_cards (kind, sort_order, label, title, body, caption, date_text, href, created_at, updated_at) VALUES
  ('slide', 1, '조합 소개', '클라우드컴퓨팅산업의
다음 단계를 함께 설계합니다', '한국클라우드컴퓨팅연구조합은 클라우드컴퓨팅산업이 4차 산업 및 지능정보사회로의 도약에 기여할 수 있도록 노력하겠습니다.', '한국클라우드컴퓨팅연구조합 소개', '2026-08-11', '/about/greeting', '2026-08-31 00:00:00', '2026-08-31 00:00:00'),
  ('slide', 2, '교육 · 접수중', 'AIDC 인프라 실무 교육
2026년 하반기 과정 개설', 'AI 데이터센터 설계·운영·최적화를 다루는 HW/SW 기반 실무 과정을 조합 회원사 대상으로 운영합니다.', '[KCIA] AIDC 인프라를 위한 HW/SW 기반 설계 운영·최적화 실무 교육 (9/9~11)', '2026-07-30', 'https://www.cccr-edu.or.kr/main/index.jsp', '2026-08-31 00:00:00', '2026-08-31 00:00:00'),
  ('slide', 3, '정책 과제', '국산 AI반도체 기반
K-클라우드 추진방안', '국산 AI반도체를 활용한 클라우드 서비스 실증과 공공부문 SaaS 확산을 위한 정책 과제를 공유합니다.', '『K-클라우드』 추진방안 및 공공부문 SaaS 이용 가이드라인', '2026-06-18', '/info/archive', '2026-08-31 00:00:00', '2026-08-31 00:00:00');

INSERT INTO home_cards (kind, sort_order, label, title, body, href, created_at, updated_at) VALUES
  ('banner', 1, '법령', '클라우드컴퓨팅법 시행 개정안', '2023. 1. 12 시행', '/info/archive', '2026-08-31 00:00:00', '2026-08-31 00:00:00'),
  ('banner', 2, '교육', '클라우드컴퓨팅 전문기술 연간교육', '연간 교육 과정 안내', 'https://www.cccr-edu.or.kr/main/index.jsp', '2026-08-31 00:00:00', '2026-08-31 00:00:00'),
  ('banner', 3, '지침', '국가연구개발사업 연구개발비 사용기준', 'IITP · 2023 개정', '/info/archive', '2026-08-31 00:00:00', '2026-08-31 00:00:00'),
  ('banner', 4, '가이드라인', '공공부문 SaaS 이용 가이드라인', '가이드라인 배포', '/info/archive', '2026-08-31 00:00:00', '2026-08-31 00:00:00'),
  ('banner', 5, '정책', '『K-클라우드』 추진방안', '국산 AI반도체 기반 클라우드', '/info/archive', '2026-08-31 00:00:00', '2026-08-31 00:00:00'),
  ('promo', 1, '회원사 모집', '2026년 신규 회원사 가입 안내', '클라우드·AI 인프라 기업의 공동 연구개발 참여 기회', '/members/join', '2026-08-31 00:00:00', '2026-08-31 00:00:00'),
  ('promo', 2, '교육', '클라우드컴퓨팅 전문기술 연간교육', '회원사 임직원 대상 실무 중심 커리큘럼 운영', 'https://www.cccr-edu.or.kr/main/index.jsp', '2026-08-31 00:00:00', '2026-08-31 00:00:00');

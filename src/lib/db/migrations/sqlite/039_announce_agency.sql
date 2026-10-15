-- 사업공고의 전문기관과 그 약어.
--
-- 정부 사업은 부처가 주관하고 실제 접수·관리는 전문기관이 맡는 일이 많다
-- (예: 과학기술정보통신부 주관, 정보통신산업진흥원(NIPA) 전문기관).
-- 주관기관은 event_host 를 그대로 쓰고, 전문기관만 새로 둔다.
-- 약어는 목록 칸이 좁아 전문기관 이름 대신 보여 주려는 것이다. 둘 다 비워도 된다.
ALTER TABLE posts ADD COLUMN event_agency TEXT;
ALTER TABLE posts ADD COLUMN event_agency_abbr TEXT;

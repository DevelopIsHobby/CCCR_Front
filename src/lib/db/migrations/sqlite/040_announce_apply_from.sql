-- 사업공고의 접수 시작일.
--
-- 공고는 보통 '접수 기간 2026.11.01 ~ 2026.12.31' 처럼 시작과 마감이 함께 나온다.
-- 마감일은 event_apply_by 를 그대로 쓰고, 시작일만 새로 둔다.
-- 시작일이 아직 오지 않은 공고는 '접수예정'으로 보인다. 비워도 된다.
ALTER TABLE posts ADD COLUMN event_apply_from TEXT;

-- 배너 띠 카드에 그림을 붙인다.
-- 예전 홈페이지처럼 자료 종류가 한눈에 보이게 하려는 것이고,
-- 어떤 그림을 쓸지는 관리자 화면에서 고른다. 빈 값이면 화면에서 기본 문서 그림을 쓴다.
ALTER TABLE home_cards ADD COLUMN icon TEXT NOT NULL DEFAULT '';

-- 지금 올라와 있는 다섯 장에 알맞은 그림을 미리 넣어 둔다.
UPDATE home_cards SET icon = 'law'       WHERE kind = 'banner' AND label = '법령';
UPDATE home_cards SET icon = 'education' WHERE kind = 'banner' AND label = '교육';
UPDATE home_cards SET icon = 'checklist' WHERE kind = 'banner' AND label = '지침';
UPDATE home_cards SET icon = 'guide'     WHERE kind = 'banner' AND label = '가이드라인';
UPDATE home_cards SET icon = 'policy'    WHERE kind = 'banner' AND label = '정책';

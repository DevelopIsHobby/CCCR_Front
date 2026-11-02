-- 교육 과정 구분: 재직자 교육 · 미취업자 교육.
--
-- CCCR 아카데미는 두 가지를 다 연다. 한 목록에 섞이면 누구 대상인지가 먼저 보여야 한다
-- (재직자 과정은 재직 중이어야 들을 수 있다). 처음 넣은 2026년 집체교육 8개는 재직자 과정이다.
-- 받는 값은 lib/edu-course.ts 의 AUDIENCES 와 같다.
ALTER TABLE edu_courses ADD COLUMN audience TEXT NOT NULL DEFAULT '재직자';

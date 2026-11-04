-- 포토갤러리(조합 행사 사진)와 강사 모집(교육·세미나 강사) 게시판.
--
-- 포토갤러리는 알림마당, 강사 모집은 참여하기 메뉴에 둔다(lib/boards.ts).
-- 강사 지원은 사이트가 받지 않고 글에 지원 방법(사무국 메일 등)과 양식 파일만 둔다 —
-- 이력서를 사이트에 쌓으면 개인정보 보관·파기 부담이 생긴다.
-- 이미 있으면 넘어간다(두 번 돌아도 안전해야 한다. 035 주석 참고).
INSERT INTO boards (slug, name, sort_order) VALUES ('gallery', '포토갤러리', 8)
  ON CONFLICT (slug) DO NOTHING;
INSERT INTO boards (slug, name, sort_order) VALUES ('instructors', '강사 모집', 9)
  ON CONFLICT (slug) DO NOTHING;

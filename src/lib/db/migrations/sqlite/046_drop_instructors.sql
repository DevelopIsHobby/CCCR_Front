-- 강사 모집 게시판을 뺀다(lib/boards.ts). 지원은 메인 참여하기 팝업의 메일 안내로 받는다.
--
-- 게시판이 없어지면 그 글은 갈 화면이 없다. 진짜 지우지 않고 휴지통에 넣는다(30일 뒤 야간 정리가 지운다).
-- boards 의 줄은 글이 가리키고 있으므로 그대로 둔다.
UPDATE posts SET deleted_at = datetime('now')
 WHERE board = 'instructors' AND deleted_at = '';

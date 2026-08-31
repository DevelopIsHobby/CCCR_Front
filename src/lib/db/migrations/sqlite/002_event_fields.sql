-- 행사정보 게시판용 선택 입력 항목.
-- 공지사항은 비워 두므로 모두 NULL 허용이다.
ALTER TABLE posts ADD COLUMN event_host TEXT;
ALTER TABLE posts ADD COLUMN event_place TEXT;
ALTER TABLE posts ADD COLUMN event_starts_on TEXT;  -- 'YYYY-MM-DD'
ALTER TABLE posts ADD COLUMN event_ends_on TEXT;    -- 여러 날 행사만 채운다
ALTER TABLE posts ADD COLUMN event_apply_by TEXT;   -- 신청 마감일

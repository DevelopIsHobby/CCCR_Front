-- sqlite/002_event_fields.sql 과 같은 내용
ALTER TABLE posts ADD COLUMN event_host TEXT;
ALTER TABLE posts ADD COLUMN event_place TEXT;
ALTER TABLE posts ADD COLUMN event_starts_on TEXT;  -- 'YYYY-MM-DD'
ALTER TABLE posts ADD COLUMN event_ends_on TEXT;    -- 여러 날 행사만 채운다
ALTER TABLE posts ADD COLUMN event_apply_by TEXT;   -- 신청 마감일

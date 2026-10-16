-- sqlite/040_announce_apply_from.sql 과 같은 내용 (까닭은 그쪽 주석 참고)
ALTER TABLE posts ADD COLUMN event_apply_from TEXT;

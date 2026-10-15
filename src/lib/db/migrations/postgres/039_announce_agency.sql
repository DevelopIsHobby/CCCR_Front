-- sqlite/039_announce_agency.sql 과 같은 내용 (까닭은 그쪽 주석 참고)
ALTER TABLE posts ADD COLUMN event_agency TEXT;
ALTER TABLE posts ADD COLUMN event_agency_abbr TEXT;

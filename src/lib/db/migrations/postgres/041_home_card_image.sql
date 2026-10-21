-- sqlite/041_home_card_image.sql 과 같은 내용 (까닭은 그쪽 주석 참고)
ALTER TABLE home_cards ADD COLUMN image_url TEXT NOT NULL DEFAULT '';

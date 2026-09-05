-- sqlite/029_soft_delete.sql 과 같은 내용
-- 지운 것을 되돌릴 수 있게 한다.
--
-- 지금까지는 목록에서 삭제를 누르면 그 자리에서 진짜 지워졌다. 한 줄 잘못 눌러
-- 지우면 방법이 없고, 백업은 하루 한 번이라 최선이 어제로 되돌리기다.
-- 글 하나 살리자고 하루치를 되돌릴 수는 없다.
--
-- deleted_at 이 빈 값이면 살아 있는 것이고, 시각이 적혀 있으면 휴지통에 있는 것이다.
-- 30일이 지나면 야간 정리가 진짜로 지운다.
ALTER TABLE posts ADD COLUMN deleted_at TEXT NOT NULL DEFAULT '';
ALTER TABLE companies ADD COLUMN deleted_at TEXT NOT NULL DEFAULT '';
ALTER TABLE notice_subscribers ADD COLUMN deleted_at TEXT NOT NULL DEFAULT '';
ALTER TABLE education_proposals ADD COLUMN deleted_at TEXT NOT NULL DEFAULT '';
ALTER TABLE promo_requests ADD COLUMN deleted_at TEXT NOT NULL DEFAULT '';
ALTER TABLE room_reservations ADD COLUMN deleted_at TEXT NOT NULL DEFAULT '';
ALTER TABLE about_cards ADD COLUMN deleted_at TEXT NOT NULL DEFAULT '';
ALTER TABLE departments ADD COLUMN deleted_at TEXT NOT NULL DEFAULT '';
ALTER TABLE history_entries ADD COLUMN deleted_at TEXT NOT NULL DEFAULT '';

CREATE INDEX idx_posts_deleted ON posts(deleted_at);
CREATE INDEX idx_companies_deleted ON companies(deleted_at);
CREATE INDEX idx_notice_subscribers_deleted ON notice_subscribers(deleted_at);
CREATE INDEX idx_education_proposals_deleted ON education_proposals(deleted_at);
CREATE INDEX idx_promo_requests_deleted ON promo_requests(deleted_at);
CREATE INDEX idx_room_reservations_deleted ON room_reservations(deleted_at);
CREATE INDEX idx_about_cards_deleted ON about_cards(deleted_at);
CREATE INDEX idx_departments_deleted ON departments(deleted_at);
CREATE INDEX idx_history_entries_deleted ON history_entries(deleted_at);

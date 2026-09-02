-- sqlite/017_business_no.sql 과 같은 내용
-- 조합 사업자등록번호를 받아 자리표시자를 실제 번호로 바꾼다.
-- 사무국이 관리자 화면에서 이미 고쳤다면 건드리지 않는다.
UPDATE site_settings
   SET value = '107-82-13350', updated_at = '2026-09-02 00:00:00'
 WHERE key = 'businessNo' AND value = '000-00-00000';

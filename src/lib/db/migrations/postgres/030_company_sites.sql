-- sqlite/030_company_sites.sql 과 같은 내용
-- 회원사 홈페이지 주소를 바로잡는다 (2026-09-14 사무국 확인).
-- 옛 주소가 응답하지 않거나(노브레이크·틸론·SK) https 로는 열리지 않는다(디노아이티).
-- 디노아이티는 http 로만 열려 http:// 를 붙여 둔다. 링크는 붙은 앞머리를 그대로 쓴다.
-- 관리자 화면에서 이미 고쳤다면 건드리지 않도록 옛 주소일 때만 바꾼다.
UPDATE companies SET site = 'nobreak.kr', updated_at = '2026-09-14 00:00:00' WHERE site = 'www.nobreak.co.kr';
UPDATE companies SET site = 'www.tilon.com/home', updated_at = '2026-09-14 00:00:00' WHERE site = 'www.tilon.co.kr';
UPDATE companies SET site = 'www.sk.co.kr', updated_at = '2026-09-14 00:00:00' WHERE site = 'cc.sk.co.kr';
UPDATE companies SET site = 'http://www.dinnoit.com', updated_at = '2026-09-14 00:00:00' WHERE site = 'www.dinnoit.com';

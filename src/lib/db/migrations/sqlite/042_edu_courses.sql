-- CCCR 아카데미 교육 과정. 메인의 'CCCR 아카데미' 영역에 포스터와 함께 보인다.
--
-- 사무국이 관리자 화면(교육 과정)에서 고친다. 처음 값은 아카데미 '운영과정' 쪽
-- (cccr-edu.or.kr, 2026년 연간 교육 일정)에 실린 집체교육 8개 과정을 그대로 옮겼다.
-- 아카데미 쪽을 자동으로 읽어 오지 않는 것은, 그 쪽 모양이 바뀌면 조용히 깨지기 때문이다.
--
-- 날짜는 'YYYY-MM-DD' 글자(한국 시각). 접수 마감일 당일까지 접수중이다(lib/edu-course.ts).
-- 포스터는 본문 그림과 같은 저장소(/api/images/N). 비어 있으면 화면이 과정명으로 그린다.
CREATE TABLE edu_courses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  summary     TEXT    NOT NULL DEFAULT '',
  href        TEXT    NOT NULL DEFAULT '',
  poster_url  TEXT    NOT NULL DEFAULT '',
  apply_from  TEXT    NOT NULL,
  apply_until TEXT    NOT NULL,
  starts_on   TEXT    NOT NULL,
  ends_on     TEXT    NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_visible  INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);

INSERT INTO edu_courses
  (title, summary, href, apply_from, apply_until, starts_on, ends_on, sort_order, created_at, updated_at)
VALUES
  ('터미널 AI 에이전트(Claude Code) 기반 MCP 구축 및 AI Agent 개발', '집체 · 5일 · 40시간', 'https://www.cccr-edu.or.kr/course/course_view.jsp?id=204656&cid=3998&lnb=4301&ch=course', '2026-07-02', '2026-07-24', '2026-07-27', '2026-07-31', 1, '2026-11-02 00:00:00', '2026-11-02 00:00:00'),
  ('클라우드 기반 RAG 설계 및 고도화 실무', '집체 · 3일 · 24시간', 'https://www.cccr-edu.or.kr/course/course_view.jsp?id=204657&cid=3998&lnb=4301&ch=course', '2026-07-02', '2026-08-07', '2026-08-10', '2026-08-12', 2, '2026-11-02 00:00:00', '2026-11-02 00:00:00'),
  ('오픈스택을 이용한 프라이빗 클라우드 운영', '집체 · 4일 · 32시간', 'https://www.cccr-edu.or.kr/course/course_view.jsp?id=204658&cid=3998&lnb=4301&ch=course', '2026-07-02', '2026-08-14', '2026-08-18', '2026-08-21', 3, '2026-11-02 00:00:00', '2026-11-02 00:00:00'),
  ('IaC를 활용한 인프라 배포 자동화', '집체 · 5일 · 40시간', 'https://www.cccr-edu.or.kr/course/course_view.jsp?id=204659&cid=3998&lnb=4301&ch=course', '2026-07-13', '2026-09-04', '2026-09-07', '2026-09-11', 4, '2026-11-02 00:00:00', '2026-11-02 00:00:00'),
  ('클라우드 네이티브 기반 컨테이너 오케스트레이션 및 쿠버네티스 구축·운영', '집체 · 5일 · 40시간', 'https://www.cccr-edu.or.kr/course/course_view.jsp?id=204660&cid=3998&lnb=4301&ch=course', '2026-09-07', '2026-10-30', '2026-11-02', '2026-11-06', 5, '2026-11-02 00:00:00', '2026-11-02 00:00:00'),
  ('CI/CD 파이프라인을 통한 애플리케이션 배포 자동화', '집체 · 4일 · 32시간', 'https://www.cccr-edu.or.kr/course/course_view.jsp?id=204661&cid=3998&lnb=4301&ch=course', '2026-09-21', '2026-11-13', '2026-11-16', '2026-11-19', 6, '2026-11-02 00:00:00', '2026-11-02 00:00:00'),
  ('산업 전반을 위한 퍼블릭 클라우드 인프라 구축 및 자동화 실습 과정', '집체 · 5일 · 40시간', 'https://www.cccr-edu.or.kr/course/course_view.jsp?id=204662&cid=3998&lnb=4301&ch=course', '2026-09-28', '2026-11-20', '2026-11-23', '2026-11-27', 7, '2026-11-02 00:00:00', '2026-11-02 00:00:00'),
  ('멀티 클라우드 서비스 기반 인프라 구축 및 Private AI 운영', '집체 · 8일 · 64시간', 'https://www.cccr-edu.or.kr/course/course_view.jsp?id=204663&cid=3998&lnb=4301&ch=course', '2026-10-06', '2026-11-27', '2026-11-30', '2026-12-09', 8, '2026-11-02 00:00:00', '2026-11-02 00:00:00');

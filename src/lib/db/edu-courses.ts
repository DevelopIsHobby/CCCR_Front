import "server-only";
import { ready } from "./migrate";
import type { EduCourse } from "@/lib/edu-course";

/*
  CCCR 아카데미 교육 과정(migrations/042). 사무국이 관리자 화면에서 고친다.
  상태 셈과 메인 차례는 lib/edu-course.ts 가 한다.
*/
type RawCourse = {
  id: number;
  title: string;
  summary: string;
  href: string;
  poster_url: string;
  apply_from: string;
  apply_until: string;
  starts_on: string;
  ends_on: string;
  is_visible: number;
};

const toCourse = (r: RawCourse): EduCourse => ({
  id: Number(r.id),
  title: r.title,
  summary: r.summary ?? "",
  href: r.href ?? "",
  posterUrl: r.poster_url ?? "",
  applyFrom: r.apply_from,
  applyUntil: r.apply_until,
  startsOn: r.starts_on,
  endsOn: r.ends_on,
  isVisible: Number(r.is_visible) === 1,
});

const SELECT = `SELECT id, title, summary, href, poster_url, apply_from, apply_until, starts_on, ends_on, is_visible
                FROM edu_courses`;

/** 메인용. 숨긴 것은 뺀다. 어느 것을 어떤 차례로 보일지는 homeCourses() 가 정한다 */
export async function listVisibleCourses(): Promise<EduCourse[]> {
  const db = await ready();
  return (await db.all<RawCourse>(`${SELECT} WHERE is_visible = 1`)).map(toCourse);
}

/** 관리자 화면용. 숨긴 것까지, 교육 시작이 늦은 것부터(새로 넣은 과정이 위로) */
export async function listAllCourses(): Promise<EduCourse[]> {
  const db = await ready();
  return (await db.all<RawCourse>(`${SELECT} ORDER BY starts_on DESC, id DESC`)).map(toCourse);
}

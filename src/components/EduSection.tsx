import EduShowcase from "./EduShowcase";
import SmartLink from "./SmartLink";
import { IconArrow } from "./Icons";
import { listVisibleCourses } from "@/lib/db/edu-courses";
import { homeCourses } from "@/lib/edu-course";
import { today } from "@/lib/format";
import { EDUCATION_SCHEDULE_URL } from "@/lib/site-data";

/*
  메인 'CCCR 아카데미' 영역(연회색 띠).

  메인 띠는 세 가지 색만 쓴다. 남색은 위(슬라이드)와 아래(참여하기) 둘뿐이고,
  그 사이는 흰색 → 연회색(아카데미) → 흰색(주요 정책) → 연회색(포토갤러리)으로 번갈아 둔다.
  가운데 띠마다 다른 파랑·회색에 무늬·번짐까지 얹었더니 저마다 따로 놀았다(2026-11-03,
  시안 셋 중 사무국이 고름). 무늬 없이 평평한 바탕으로 둔다.
  접수중·접수예정 과정이 하나도 없으면 영역을 접고 아카데미 일정으로만 이어 준다.
*/
export default async function EduSection() {
  const now = today();
  const courses = homeCourses(await listVisibleCourses(), now, 4);

  return (
    <section className="relative overflow-hidden bg-surface py-12 lg:py-14" aria-labelledby="edu-heading">

      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="data-line text-flame-500">재직자 교육 · 미취업자 교육</p>
            <h2 id="edu-heading" className="mt-3 text-2xl font-bold text-navy-900 lg:text-3xl">
              CCCR 아카데미
            </h2>
          </div>
          {courses.length > 0 && (
            <SmartLink
              href={EDUCATION_SCHEDULE_URL}
              className="group inline-flex items-center gap-2 text-base font-semibold text-brand-600 hover:text-navy-900"
            >
              전체 교육 일정
              <IconArrow className="size-4 transition-transform group-hover:translate-x-0.5" />
            </SmartLink>
          )}
        </div>

        {courses.length > 0 ? (
          <EduShowcase courses={courses} today={now} />
        ) : (
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-md text-ink-600">
            지금 접수 중인 과정이 없습니다.
            <SmartLink
              href={EDUCATION_SCHEDULE_URL}
              className="group inline-flex items-center gap-2 font-semibold text-brand-600 hover:underline"
            >
              아카데미 교육 일정 보기
              <IconArrow className="size-4 transition-transform group-hover:translate-x-0.5" />
            </SmartLink>
          </p>
        )}
      </div>
    </section>
  );
}

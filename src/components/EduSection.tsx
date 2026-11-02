import EduShowcase from "./EduShowcase";
import SmartLink from "./SmartLink";
import { IconArrow } from "./Icons";
import { listVisibleCourses } from "@/lib/db/edu-courses";
import { homeCourses } from "@/lib/edu-course";
import { today } from "@/lib/format";
import { EDUCATION_SCHEDULE_URL } from "@/lib/site-data";

/*
  메인 'CCCR 아카데미' 영역(남색 띠).

  메인은 흰 바탕(조합 소식) → 회색(주요 정책) → 남색(회원사 참여) 차례라, 그 사이에
  짙은 띠를 하나 더 두어 포스터가 돋보이고 영역이 번갈아 읽히게 한다.
  슬라이드·참여하기와 같은 남색이면 세 띠가 똑같아 지루하다 — 여기는 한 단계 밝은 파랑.
  접수중·접수예정 과정이 하나도 없으면 영역을 접고 아카데미 일정으로만 이어 준다.
*/
export default async function EduSection() {
  const now = today();
  const courses = homeCourses(await listVisibleCourses(), now, 4);

  return (
    <section className="relative overflow-hidden bg-brand-700 py-12 lg:py-14" aria-labelledby="edu-heading">
      <div className="hex-field absolute inset-0" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-navy-800 via-brand-700 to-brand-600"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="data-line text-flame-500">재직자 교육 · 미취업자 교육</p>
            <h2 id="edu-heading" className="mt-3 text-2xl font-bold text-white lg:text-3xl">
              CCCR 아카데미
            </h2>
          </div>
          {courses.length > 0 && (
            <SmartLink
              href={EDUCATION_SCHEDULE_URL}
              className="group inline-flex items-center gap-2 text-base font-semibold text-white/80 hover:text-white"
            >
              전체 교육 일정
              <IconArrow className="size-4 transition-transform group-hover:translate-x-0.5" />
            </SmartLink>
          )}
        </div>

        {courses.length > 0 ? (
          <EduShowcase courses={courses} today={now} />
        ) : (
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-md text-brand-100/80">
            지금 접수 중인 과정이 없습니다.
            <SmartLink
              href={EDUCATION_SCHEDULE_URL}
              className="group inline-flex items-center gap-2 font-semibold text-white hover:underline"
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

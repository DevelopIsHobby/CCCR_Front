import EduShowcase from "./EduShowcase";
import SmartLink from "./SmartLink";
import { IconArrow } from "./Icons";
import { listVisibleCourses } from "@/lib/db/edu-courses";
import { homeCourses } from "@/lib/edu-course";
import { today } from "@/lib/format";
import { EDUCATION_SCHEDULE_URL } from "@/lib/site-data";

/*
  메인 'CCCR 아카데미' 영역(옅은 하늘빛 띠).

  메인의 짙은 띠는 위(슬라이드)와 아래(참여하기) 둘만 같은 남색으로 맞춘다.
  가운데까지 짙게 두니 남색·파랑·검정에 가까운 띠 셋이 저마다 따로 놀았다.
  여기는 흰색에 가까운 바탕으로 두고, 바로 아래 '주요 정책'(회색 surface)과
  붙어 보이지 않게 아주 옅은 파랑을 쓴다.
  접수중·접수예정 과정이 하나도 없으면 영역을 접고 아카데미 일정으로만 이어 준다.
*/
export default async function EduSection() {
  const now = today();
  const courses = homeCourses(await listVisibleCourses(), now, 4);

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-brand-100/70 py-12 lg:py-14"
      aria-labelledby="edu-heading"
    >
      <div className="hex-soft absolute inset-0" aria-hidden />

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

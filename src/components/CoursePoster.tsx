import { formatRange, type EduCourse } from "@/lib/edu-course";

/*
  과정 포스터.

  사무국이 올린 그림이 있으면 그것을, 없으면 과정명으로 포스터를 그린다. 포스터가 없는
  과정이 섞여도 메인의 큰 포스터 자리가 비지 않게 하려는 것이다.

  올린 포스터는 자르지 않는다(object-contain). 포스터에는 글자가 들어 있어 잘리면
  읽을 수 없다. 비율이 맞지 않아 남는 곳은 남색 바탕이 채운다.
  틀은 16:10 이다(관리자 화면 권장 크기 1200 × 750).
*/
export default function CoursePoster({
  course,
  compact = false,
}: {
  course: Pick<EduCourse, "title" | "posterUrl" | "summary" | "startsOn" | "endsOn">;
  /** 목록의 작은 썸네일. 글자를 줄여 넣는다 */
  compact?: boolean;
}) {
  if (course.posterUrl) {
    return (
      <div className="aspect-[16/10] bg-navy-950">
        {/* 크기를 미리 알 수 없는 관리자 그림이라 next/image 대신 img 를 쓴다 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={course.posterUrl} alt={course.title} className="size-full object-contain" />
      </div>
    );
  }

  /* 자동 포스터. 히어로와 같은 육각 무늬·남색 바탕으로 사이트와 한 벌로 보이게 한다 */
  return (
    <div
      role="img"
      aria-label={course.title}
      className="relative flex aspect-[16/10] flex-col justify-between overflow-hidden bg-navy-900"
    >
      <span className="hex-field absolute inset-0" aria-hidden />
      <span
        className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-700/70"
        aria-hidden
      />
      <span className="absolute inset-x-0 bottom-0 h-1 bg-flame-500" aria-hidden />
      {/* 히어로 슬라이드와 같은 번진 빛 한 점. 빈 남색 상자처럼 보이지 않게 */}
      <span
        className="absolute -right-16 -top-16 size-2/3 rounded-full bg-brand-500/25 blur-3xl"
        aria-hidden
      />
      {compact ? (
        <span className="relative line-clamp-3 p-2.5 text-[11px] font-bold leading-snug text-white">
          {course.title}
        </span>
      ) : (
        <>
          <span className="relative px-7 pt-6 text-sm font-semibold tracking-wide text-flame-500 lg:px-9 lg:pt-8">
            CCCR ACADEMY
          </span>
          <span className="relative px-7 pb-7 lg:px-9 lg:pb-9">
            <span className="block text-xl font-bold leading-snug text-white [word-break:keep-all] lg:text-2xl">
              {course.title}
            </span>
            <span className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-mono text-xl font-semibold text-brand-100 lg:text-2xl">
                {formatRange(course.startsOn, course.endsOn)}
              </span>
              {course.summary && <span className="text-base text-brand-100/70">{course.summary}</span>}
            </span>
          </span>
        </>
      )}
    </div>
  );
}

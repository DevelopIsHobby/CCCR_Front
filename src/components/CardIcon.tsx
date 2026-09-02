/*
  배너 띠 카드 그림.
  사이트 다른 아이콘과 같은 규칙(24 격자·1.5 선)으로 그려 인상이 어긋나지 않게 한다.
*/
import type { HomeCardIconId } from "@/lib/home-card-icons";
import { normalizeIcon } from "@/lib/home-card-icons";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

const PATHS: Record<HomeCardIconId, React.ReactNode> = {
  /* 저울 — 법령 */
  law: (
    <>
      <path d="M12 4v16M7 20h10M4 8h16M9.5 6.2 12 4l2.5 2.2" />
      <path d="M4 8 1.8 13.2a2.6 2.6 0 0 0 4.4 0z" />
      <path d="M20 8l-2.2 5.2a2.6 2.6 0 0 0 4.4 0z" />
    </>
  ),
  /* 깃발 — 정책 */
  policy: (
    <>
      <path d="M6 21V4" />
      <path d="M6 4.5h11l-2.2 3.4L17 11.5H6z" />
    </>
  ),
  /* 클립보드 체크 — 지침 */
  checklist: (
    <>
      <rect x="5" y="4.5" width="14" height="16" rx="2" />
      <path d="M9 4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5v1H9z" />
      <path d="m9 12 1.8 1.8L14.8 10" />
      <path d="M9 17h6" />
    </>
  ),
  /* 펼친 책 — 가이드라인 */
  guide: (
    <>
      <path d="M12 6.5C10.5 5.2 8.6 4.5 6 4.5H3.5v13H6c2.6 0 4.5.7 6 2 1.5-1.3 3.4-2 6-2h2.5v-13H18c-2.6 0-4.5.7-6 2z" />
      <path d="M12 6.5v14" />
    </>
  ),
  /* 학사모 — 교육 */
  education: (
    <>
      <path d="M2.5 9 12 4.5 21.5 9 12 13.5z" />
      <path d="M6.5 11v5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-5" />
      <path d="M21.5 9v5" />
    </>
  ),
  /* 확성기 — 공고 */
  notice: (
    <>
      <path d="M4 10v4a1 1 0 0 0 1 1h3l6 4V5L8 9H5a1 1 0 0 0-1 1z" />
      <path d="M17.5 9.2a4 4 0 0 1 0 5.6" />
    </>
  ),
  /* 막대가 있는 문서 — 보고서 */
  report: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 17v-3M12 17v-5M15 17v-2" />
    </>
  ),
  /* 돋보기 — 연구개발 */
  research: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5 5" />
      <path d="M8 10.5h5M10.5 8v5" />
    </>
  ),
  /* 구름 — 클라우드 */
  cloud: (
    <>
      <path d="M7 18h10.5a3.5 3.5 0 0 0 .3-7 5.5 5.5 0 0 0-10.6-1A4 4 0 0 0 7 18z" />
    </>
  ),
  /* 반도체 칩 — 기술 */
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10.5 10.5h3v3h-3z" />
      <path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" />
    </>
  ),
  /* 달력 — 일정 */
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
      <path d="M7.5 14h3v3h-3z" />
    </>
  ),
  /* 내려받기 */
  download: (
    <>
      <path d="M12 4v10" />
      <path d="m8 10.5 4 4 4-4" />
      <path d="M4.5 17v1.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V17" />
    </>
  ),
};

export default function CardIcon({
  name,
  className,
}: {
  name: string | null | undefined;
  className?: string;
}) {
  return (
    <svg {...base} className={className} aria-hidden>
      {PATHS[normalizeIcon(name)]}
    </svg>
  );
}

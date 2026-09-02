/*
  배너 띠 카드에 붙이는 그림 목록.
  관리자 화면(클라이언트)에서도 쓰므로 그림(SVG)과 떼어 이름만 여기에 둔다.
  실제 그림은 components/CardIcon.tsx 가 그린다.
*/
export const HOME_CARD_ICONS = [
  { id: "law", label: "법령" },
  { id: "policy", label: "정책" },
  { id: "checklist", label: "지침" },
  { id: "guide", label: "가이드라인" },
  { id: "education", label: "교육" },
  { id: "notice", label: "공고" },
  { id: "report", label: "보고서 · 통계" },
  { id: "research", label: "연구개발" },
  { id: "cloud", label: "클라우드" },
  { id: "chip", label: "반도체 · 기술" },
  { id: "calendar", label: "일정 · 행사" },
  { id: "download", label: "자료 내려받기" },
] as const;

export type HomeCardIconId = (typeof HOME_CARD_ICONS)[number]["id"];

const IDS = new Set<string>(HOME_CARD_ICONS.map((i) => i.id));

/** DB 에 없는 이름이 들어 있어도 화면이 깨지지 않도록 기본 그림으로 되돌린다. */
export function normalizeIcon(value: string | null | undefined): HomeCardIconId {
  return value && IDS.has(value) ? (value as HomeCardIconId) : "guide";
}

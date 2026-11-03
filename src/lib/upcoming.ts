/*
  메인 '다가오는 일정' 칸에 넣을 일정 고르기.

  행사(여는 날)·사업공고(접수 마감일)·아카데미 교육(교육 시작일)을 날짜 순으로 섞어
  가까운 것부터 n 건. 오늘 날짜인 것도 넣는다(당일 행사·당일 마감). 지난 것은 뺀다.
  날짜는 'YYYY-MM-DD' 글자라 글자 비교가 곧 날짜 비교다.
*/
export type UpcomingKind = "행사" | "교육" | "공고 마감";

export type UpcomingEntry = {
  key: string;
  date: string;
  kind: UpcomingKind;
  title: string;
  href: string;
};

export function pickUpcoming(entries: UpcomingEntry[], today: string, n: number): UpcomingEntry[] {
  return entries
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date === b.date ? a.key.localeCompare(b.key) : a.date < b.date ? -1 : 1))
    .slice(0, n);
}

import Link from "next/link";
import SmartLink from "./SmartLink";
import { daysBetween } from "@/lib/edu-course";
import type { UpcomingEntry, UpcomingKind } from "@/lib/upcoming";

const KIND_TONE: Record<UpcomingKind, string> = {
  행사: "text-flame-600",
  교육: "text-navy-800",
  "공고 마감": "text-brand-600",
};

/*
  메인 '다가오는 일정' — 조합 소식 오른쪽 칸.

  전에는 이 자리에 '지금 모집 중' 홍보 알림판이 있었다. 홍보 칸이 너무 많다는 의견으로 뺐더니
  목록만 폭 가득 늘어서 눈 둘 곳이 없었다(2026-11-03). 홍보 대신 쓸모 있는 정보로 그 자리를
  채운다: 앞으로 열릴 행사·교육과 마감이 남은 사업공고를 날짜 순으로. 큰 날짜 숫자가 눈이 먼저
  가는 자리 노릇을 한다. 내용은 행사정보·사업공고 글과 아카데미 교육 과정에서 저절로 채워진다.
*/
export default function UpcomingCard({ items, today }: { items: UpcomingEntry[]; today: string }) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-surface p-6 ring-1 ring-line lg:p-7">
      <ul className="flex flex-1 flex-col divide-y divide-line" aria-label="다가오는 일정">
        {items.length === 0 && (
          <li className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
            <p className="text-md text-ink-400">다가오는 일정이 없습니다.</p>
            <Link href="/board/events" className="text-base font-semibold text-brand-600 hover:underline">
              행사정보 보기
            </Link>
          </li>
        )}

        {items.map((item) => {
          const left = daysBetween(today, item.date);
          /* 일주일 안이면 남은 날을 주황으로 알린다 */
          const dday = left === 0 ? "오늘" : `D-${left}`;
          const soon = left <= 7;
          return (
            <li key={item.key} className="py-4 first:pt-0 last:pb-0">
              <SmartLink href={item.href} className="group flex items-center gap-4">
                {/* 날짜 칸. 일을 크게, 달은 작게 */}
                <span className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-white py-2 ring-1 ring-line transition-colors group-hover:ring-brand-500">
                  <span className="text-2xs font-semibold text-ink-400">
                    {Number(item.date.slice(5, 7))}월
                  </span>
                  <span className="text-2xl font-bold leading-none tabular-nums text-navy-900">
                    {Number(item.date.slice(8, 10))}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-xs font-bold">
                    <span className={KIND_TONE[item.kind]}>{item.kind}</span>
                    <span className={soon ? "text-flame-500" : "text-ink-400"}>{dday}</span>
                  </span>
                  <span className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-ink-900 transition-colors group-hover:text-brand-600">
                    {item.title}
                  </span>
                </span>
              </SmartLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, DefTable } from "@/components/sub/Ui";
import { TRANSPORT } from "@/lib/page-data";

export const metadata: Metadata = { title: "찾아오시는 길" };

export default function Page() {
  return (
    <PageShell
      href="/about/location"
      desc="조합 사무국 위치와 교통편을 안내해 드립니다."
    >
      {/* 지도 — 카카오/네이버 지도 스크립트로 교체 */}
      <div className="relative grid aspect-[16/7] place-items-center overflow-hidden rounded-2xl border border-line bg-surface">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col items-center text-center">
          <span className="grid size-12 place-items-center rounded-full bg-flame-500 text-white shadow-[0_8px_20px_-6px_rgba(240,90,40,0.8)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="size-6"
              aria-hidden
            >
              <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <p className="mt-4 text-lg font-bold text-navy-900">한국클라우드컴퓨팅연구조합</p>
          <p className="label-mono mt-2 text-ink-400">지도 API 연동 영역</p>
        </div>
      </div>

      {/* 기본 정보 */}
      <section className="mt-16">
        <SectionHeading eyebrow="평일 09:00 – 18:00" title="사무국 안내" />
        <div className="mt-10">
          <DefTable
            rows={[
              { label: "주소", value: "서울특별시 강남구 테헤란로 000, 00빌딩 0층 (우 00000)" },
              { label: "대표전화", value: "02-2052-0156 (사무국)" },
              {
                label: "이메일",
                value: (
                  <a href="mailto:admin@cccr.or.kr" className="text-brand-600 hover:underline">
                    admin@cccr.or.kr
                  </a>
                ),
              },
              { label: "운영시간", value: "평일 09:00 – 18:00 (점심시간 12:00 – 13:00 / 주말·공휴일 휴무)" },
            ]}
          />
        </div>
      </section>

      {/* 교통편 */}
      <section className="mt-20">
        <SectionHeading eyebrow="지하철 · 버스 · 자가용" title="교통편" />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {TRANSPORT.map((t) => (
            <div key={t.type} className="rounded-xl border border-line bg-white p-7">
              <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
                {t.type}
              </span>
              <ul className="mt-5 space-y-3">
                {t.lines.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2.5 text-md leading-relaxed text-ink-600"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-flame-500" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

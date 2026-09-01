import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { DefTable } from "@/components/sub/Ui";
import { BADGE_COLOR } from "@/lib/page-data";
import { listOffices } from "@/lib/db/site-content";
import { parseTransit, type Office } from "@/lib/site-content-types";

export const metadata: Metadata = { title: "찾아오시는 길" };

const anchor = (i: number) => `office-${i + 1}`;

function Badge({ code }: { code: string }) {
  return (
    <span
      className="label-mono grid size-5 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold text-white"
      style={{ backgroundColor: BADGE_COLOR[code] ?? "#7C8798" }}
      aria-hidden
    >
      {code}
    </span>
  );
}

function IconWalk({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="13" cy="4.5" r="1.8" />
      <path d="M11 21l1.5-5.5L10 13l1-5 3.5 2 2.5 1" />
      <path d="M10 13l-2 3.5M12.5 15.5L15 21" />
    </svg>
  );
}

/* 지도 API 연동 전까지 쓰는 자리표시자. 도보 안내는 지도에서 걸어오는
   설명이라 별도 박스로 띄우지 않고 지도 아래 캡션으로 붙인다. */
function MapCard({ address, note }: { address: string; note: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="relative grid aspect-[16/6] place-items-center bg-surface">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col items-center px-6 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-flame-500 text-white shadow-[0_8px_20px_-6px_rgba(240,90,40,0.8)]">
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
        <p className="mt-3 max-w-md text-md font-bold text-navy-900">{address}</p>
        <p className="label-mono mt-1.5 text-ink-400">지도 API 연동 영역</p>
        </div>
      </div>

      <p className="flex items-start gap-3 border-t border-line bg-white px-6 py-4">
        <IconWalk className="mt-0.5 size-5 shrink-0 text-flame-500" />
        <span className="text-md leading-relaxed text-ink-700">{note}</span>
      </p>
    </div>
  );
}

function OfficeSection({ office, index }: { office: Office; index: number }) {
  return (
    <section id={anchor(index)} className="scroll-mt-32">
      <h2 className="border-b-2 border-navy-900 pb-5 text-2xl font-bold text-navy-900">
        {office.name}
      </h2>

      <div className="mt-8">
        <MapCard address={office.address} note={office.note} />
      </div>

      <div className="mt-10">
        <DefTable
          rows={[
            { label: "주소", value: office.address },
            {
              label: "전화번호",
              value: (
                <a
                  href={`tel:${office.tel.replace(/-/g, "")}`}
                  className="label-mono tabular-nums text-brand-600 hover:underline"
                >
                  {office.tel}
                </a>
              ),
            },
            {
              label: "팩스번호",
              value: <span className="label-mono tabular-nums">{office.fax}</span>,
            },
          ]}
        />
      </div>

      <h3 className="mt-14 text-xl font-bold text-navy-900">교통편</h3>
      <dl className="mt-6 border-t-2 border-navy-900">
        {parseTransit(office.transit).map((g) => (
          <div
            key={g.group}
            className="flex flex-col gap-3 border-b border-line py-6 sm:flex-row sm:gap-10"
          >
            <dt className="w-full shrink-0 sm:w-28">
              <span className="inline-flex rounded bg-brand-50 px-3 py-1.5 text-2xs font-bold text-brand-700">
                {g.group}
              </span>
            </dt>
            <dd className="min-w-0 flex-1 space-y-3.5">
              {g.items.map((item) => (
                <p key={item.text} className="flex items-start gap-2.5">
                  <span className="flex shrink-0 gap-1 pt-0.5">
                    {item.badges.map((b) => (
                      <Badge key={b} code={b} />
                    ))}
                  </span>
                  <span className="text-md leading-relaxed text-ink-600">{item.text}</span>
                </p>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default async function Page() {
  const offices = await listOffices();

  return (
    <PageShell href="/about/location" desc="조합 사무실과 교육장 위치를 안내해 드립니다.">
      {/* 사무실이 두 곳이라 위로 건너뛸 수 있게 둔다 */}
      <nav aria-label="사무실 바로가기" className="flex flex-wrap gap-2">
        {offices.map((o, i) => (
          <a
            key={o.name}
            href={`#${anchor(i)}`}
            className="rounded-full border border-line px-5 py-2.5 text-base font-semibold text-ink-700 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
          >
            {o.name}
          </a>
        ))}
      </nav>

      <div className="mt-14 space-y-24">
        {offices.map((o, i) => (
          <OfficeSection key={o.id} office={o} index={i} />
        ))}
      </div>
    </PageShell>
  );
}

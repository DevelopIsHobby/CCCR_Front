import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading } from "@/components/sub/Ui";
import { OFFICES, BADGE_COLOR, type Office } from "@/lib/page-data";

export const metadata: Metadata = { title: "찾아오시는 길" };

function Badge({ code }: { code: string }) {
  return (
    <span
      className="label-mono grid size-5 shrink-0 place-items-center rounded text-[0.65rem] font-bold text-white"
      style={{ backgroundColor: BADGE_COLOR[code] ?? "#7C8798" }}
      aria-hidden
    >
      {code}
    </span>
  );
}

/* 지도 API 연동 전까지 쓰는 자리표시자 */
function MapPlaceholder({ address }: { address: string }) {
  return (
    <div className="relative grid aspect-[16/7] place-items-center overflow-hidden rounded-xl border border-line bg-surface">
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
        <p className="mt-3 text-md font-bold text-navy-900">{address}</p>
        <p className="label-mono mt-1.5 text-ink-400">지도 API 연동 영역</p>
      </div>
    </div>
  );
}

function OfficeBlock({ office }: { office: Office }) {
  return (
    <div>
      <span className="inline-flex rounded bg-flame-500 px-4 py-2 text-base font-bold text-white">
        {office.name}
      </span>

      <div className="mt-5">
        <MapPlaceholder address={office.address} />
      </div>

      <ul className="mt-6 space-y-1.5">
        <li className="text-md text-ink-700">– {office.address}</li>
        <li className="text-md text-ink-700">
          – 전화번호 :{" "}
          <a
            href={`tel:${office.tel.replace(/-/g, "")}`}
            className="label-mono tabular-nums text-brand-600 hover:underline"
          >
            {office.tel}
          </a>
        </li>
        <li className="text-md text-ink-700">
          – 팩스번호 : <span className="label-mono tabular-nums">{office.fax}</span>
        </li>
        <li className="text-md font-medium text-flame-600">* {office.note}</li>
      </ul>

      <dl className="mt-8 border-t-2 border-brand-600">
        {office.transit.map((g) => (
          <div
            key={g.group}
            className="flex flex-col gap-3 border-b border-line py-5 sm:flex-row sm:gap-8"
          >
            <dt className="w-full shrink-0 text-base font-bold text-navy-900 sm:w-32 sm:text-center">
              {g.group}
            </dt>
            <dd className="space-y-3">
              {g.items.map((item) => (
                <p key={item.text} className="flex items-start gap-2">
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
    </div>
  );
}

export default function Page() {
  return (
    <PageShell href="/about/location" desc="조합 사무실과 교육장 위치를 안내해 드립니다.">
      <SectionHeading eyebrow={`사무실 ${OFFICES.length}곳`} title="오시는 길" />

      <div className="mt-12 space-y-20">
        {OFFICES.map((o) => (
          <OfficeBlock key={o.name} office={o} />
        ))}
      </div>
    </PageShell>
  );
}

import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading, DefTable } from "@/components/sub/Ui";
import { ORG_UNITS, DEPARTMENTS, ORG_ROLES } from "@/lib/page-data";

export const metadata: Metadata = { title: "조직도" };

/* 4열 격자에서 n번째 열의 중심 (0-indexed).
   격자가 gap-4(16px) x 3 을 쓰므로 컬럼 폭은 (100% - 48px) / 4 다.
   gap 을 바꾸면 아래 GAP/GAPS 도 함께 바꿔야 한다. */
const GAP = 16;
const GAPS = GAP * 3;
const COL_W = `((100% - ${GAPS}px) / 4)`;
const PITCH = `(${COL_W} + ${GAP}px)`;
const col = (n: number) => `calc(${COL_W} / 2 + ${n} * ${PITCH})`;
const span = (from: number, to: number) => `calc(${to - from} * ${PITCH})`;

function Node({
  label,
  tone = "line",
}: {
  label: string;
  tone?: "navy" | "brand" | "line" | "soft";
}) {
  const tones = {
    navy: "bg-navy-900 text-white",
    brand: "bg-brand-600 text-white",
    line: "bg-white text-navy-900 ring-1 ring-line",
    soft: "bg-surface text-navy-900 ring-1 ring-line",
  };
  return (
    <div
      className={`flex h-14 items-center justify-center rounded-lg px-4 text-center text-base font-bold ${tones[tone]}`}
    >
      {label}
    </div>
  );
}

/** 세로 연결선 */
function VLine({ at }: { at: number }) {
  return (
    <span
      className="absolute top-0 h-full w-px bg-line"
      style={{ left: col(at) }}
      aria-hidden
    />
  );
}

/** 가로 연결선 — 두 열의 중심을 정확히 잇는다 */
function HLine({ from, to, className = "" }: { from: number; to: number; className?: string }) {
  return (
    <span
      className={`absolute h-px bg-line ${className}`}
      style={{ left: col(from), width: span(from, to) }}
      aria-hidden
    />
  );
}

export default function Page() {
  return (
    <PageShell
      href="/about/organization"
      desc="총회와 이사회를 중심으로 이사장 아래 사무국이 실무를 수행합니다."
    >
      <section>
        <SectionHeading eyebrow="총회 · 이사회 · 사무국" title="조직 구성" />

        <div className="mt-12 overflow-x-auto rounded-2xl bg-surface p-8 lg:p-12">
          <div className="min-w-[760px]">
            {/* 1행 — 총회 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-start-2">
                <Node label={ORG_UNITS.assembly} tone="navy" />
              </div>
            </div>

            {/* 총회 → 이사장 */}
            <div className="relative h-8">
              <VLine at={1} />
            </div>

            {/* 2행 — 이사회 · 이사장 · 감사 */}
            <div className="relative grid grid-cols-4 gap-4">
              <HLine from={0} to={2} className="top-7" />
              <div className="relative col-start-1">
                <Node label={ORG_UNITS.board} />
              </div>
              <div className="relative col-start-2">
                <Node label={ORG_UNITS.chair} tone="navy" />
              </div>
              <div className="relative col-start-3">
                <Node label={ORG_UNITS.audit} />
              </div>
            </div>

            {/* 이사회 → 자문위원회, 이사장 → 사무국 */}
            <div className="relative h-8">
              <VLine at={0} />
              <VLine at={1} />
            </div>

            {/* 3행 — 자문위원회 · 사무국 */}
            <div className="relative grid grid-cols-4 gap-4">
              <HLine from={0} to={1} className="top-7" />
              <div className="relative col-start-1">
                <Node label={ORG_UNITS.advisory} />
              </div>
              <div className="relative col-start-2">
                <Node label={ORG_UNITS.office} tone="brand" />
              </div>
            </div>

            {/* 사무국 → 4개 팀 */}
            <div className="relative h-10">
              <VLine at={0} />
              <VLine at={1} />
              <HLine from={0} to={3} className="top-5" />
              <span className="absolute top-5 h-5 w-px bg-line" style={{ left: col(2) }} aria-hidden />
              <span className="absolute top-5 h-5 w-px bg-line" style={{ left: col(3) }} aria-hidden />
            </div>

            {/* 4행 — 실무 팀 */}
            <div className="grid grid-cols-4 gap-4">
              {ORG_UNITS.teams.map((t) => (
                <Node key={t} label={t} tone="soft" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 부서 연락처 */}
      <section className="mt-20">
        <SectionHeading
          eyebrow={`부서 ${DEPARTMENTS.length}곳`}
          title="부서별 연락처"
          desc="문의하실 업무에 맞는 부서로 연락해 주시면 빠르게 안내해 드립니다."
        />

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-y-2 border-navy-900 bg-surface">
                <th className="px-5 py-4 text-base font-bold text-navy-900">부서</th>
                <th className="px-5 py-4 text-base font-bold text-navy-900">연락처</th>
                <th className="px-5 py-4 text-base font-bold text-navy-900">E-mail</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENTS.map((d) => (
                <tr key={d.name} className="border-b border-line hover:bg-brand-50/60">
                  <td className="px-5 py-4 text-md font-bold text-navy-900">{d.name}</td>
                  <td className="px-5 py-4">
                    <a
                      href={`tel:${d.tel.replace(/-/g, "")}`}
                      className="label-mono tabular-nums text-ink-600 hover:text-brand-600"
                    >
                      {d.tel}
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={`mailto:${d.email}`}
                      className="label-mono text-brand-600 hover:underline"
                    >
                      {d.email}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 기구별 역할 */}
      <section className="mt-20">
        <SectionHeading eyebrow={`기구 ${ORG_ROLES.length}개`} title="기구별 역할" />
        <div className="mt-10">
          <DefTable rows={ORG_ROLES} />
        </div>
      </section>
    </PageShell>
  );
}

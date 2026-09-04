import { SectionHeading } from "./Ui";

/*
  참여하기 창구 세 곳(회의실·교육사업 제안·홍보)의 안내 화면 틀.

  세 화면이 하는 말의 뼈대가 같다 — 무엇을 해 주는지, 어떻게 흘러가는지,
  무엇을 알고 신청해야 하는지. 틀을 하나로 두어 세 곳이 따로 놀지 않게 한다.
  신청 자체는 넘겨받은 단추(팝업)로 한다.
*/
export default function ServiceIntro({
  eyebrow,
  title,
  desc,
  points,
  steps,
  notes,
  action,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  /** 이 창구가 무엇을 해 주는지 */
  points: { title: string; desc: string }[];
  /** 신청부터 끝까지의 차례 */
  steps: string[];
  /** 신청 전에 알아야 할 것 */
  notes: string[];
  /** 신청 단추. 창구마다 다른 팝업이 온다. */
  action: React.ReactNode;
}) {
  return (
    <>
      <SectionHeading eyebrow={eyebrow} title={title} desc={desc} />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {points.map((p) => (
          <div key={p.title} className="rounded-xl border border-line bg-surface p-6">
            <p className="text-lg font-bold text-navy-900">{p.title}</p>
            <p className="mt-2 text-base leading-relaxed text-ink-600">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* 신청 단추 — 화면에서 가장 눈에 띄어야 할 자리 */}
      <div className="relative mt-12 overflow-hidden rounded-2xl bg-navy-900 px-6 py-10 text-center lg:px-10">
        <div className="hex-field absolute inset-0" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-700/55"
          aria-hidden
        />
        <div className="relative">
          <p className="text-xl font-bold text-white">{title}</p>
          <p className="mt-2 text-base text-brand-100/80">
            아래 단추를 누르면 신청서가 열립니다. 로그인하시면 이름·소속이 미리 채워집니다.
          </p>
          <div className="mt-7 flex justify-center">{action}</div>
        </div>
      </div>

      <section className="mt-11">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          진행 절차
        </h3>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step} className="rounded-xl border border-line bg-white p-5">
              <span className="label-mono text-flame-600">STEP {i + 1}</span>
              <p className="mt-2 text-md font-bold leading-snug text-navy-900">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-11">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          신청 전 확인해 주세요
        </h3>
        <ul className="mt-6 space-y-2.5">
          {notes.map((note) => (
            <li key={note} className="flex gap-3 text-md leading-relaxed text-ink-600">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
              {note}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

type Props = { variant?: "dark" | "light"; className?: string };

/** C3R 워드마크 — 기존 로고의 C³R + 국·영문 병기 구조를 유지한다. */
export default function Logo({ variant = "dark", className = "" }: Props) {
  const ko = variant === "dark" ? "text-ink-900" : "text-white";
  const en = variant === "dark" ? "text-ink-400" : "text-brand-200";

  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <span className="flex items-baseline font-bold tracking-tight">
        <span className="text-2xl leading-none text-flame-600">C</span>
        <span className="text-lg leading-none text-flame-600 -ml-px">3</span>
        <span className="text-2xl leading-none text-brand-600 ml-0.5">R</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`text-xs font-bold tracking-[-0.04em] sm:text-md ${ko}`}>
          한국클라우드컴퓨팅연구조합
        </span>
        <span
          className={`mt-1 hidden text-[0.5rem] font-medium tracking-[0.08em] sm:block ${en}`}
        >
          CONSORTIUM OF CLOUD COMPUTING RESEARCH
        </span>
      </span>
    </span>
  );
}

/*
  가입 단계 표시(회원 유형 → 약관 동의 → 정보 입력).

  전에는 '1단계 약관 동의 … 4단계 가입 완료' 카드 넷을 크게 늘어놓고, 실제로는
  모든 칸을 한 화면에 몰아 두었다. 이제는 단계마다 화면이 나뉘므로 지금 어디인지만
  작게 보여 준다. 사무국 승인은 신청을 마친 뒤의 일이라 단계에 넣지 않고 끝 화면에서 알린다.
*/
const STEPS = ["회원 유형", "약관 동의", "정보 입력"] as const;

export default function SignupSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol aria-label="가입 단계" className="mx-auto flex max-w-xl items-center gap-2 sm:gap-3">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const here = n === current;
        return (
          <li
            key={label}
            aria-current={here ? "step" : undefined}
            className="flex flex-1 items-center gap-2 sm:gap-3"
          >
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold ${
                here
                  ? "bg-brand-600 text-white"
                  : done
                    ? "bg-brand-100 text-brand-700"
                    : "bg-surface text-ink-400 ring-1 ring-line"
              }`}
            >
              {done ? <span aria-hidden>✓</span> : n}
              {done && <span className="sr-only">{n}단계 마침</span>}
            </span>
            <span
              className={`whitespace-nowrap text-sm sm:text-base ${
                here ? "font-bold text-navy-900" : done ? "text-ink-600" : "text-ink-400"
              }`}
            >
              {label}
            </span>
            {n < STEPS.length && <span aria-hidden className="h-px flex-1 bg-line" />}
          </li>
        );
      })}
    </ol>
  );
}

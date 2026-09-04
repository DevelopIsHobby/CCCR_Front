"use client";

import { useState } from "react";

/*
  일별 추이 꺾은선.
  라이브러리를 쓰지 않고 SVG 로 직접 그린다. 값이 서버에서 정해지므로 클라이언트 코드가 필요 없다.
*/

import {
  NEAR_LINE as _NEAR_LINE,
  PAD,
  W,
  H,
  niceMax,
  pickPoint,
  smoothPath,
  type TrendPoint,
} from "@/lib/trend-geometry";

export type { TrendPoint };

const TONE = {
  brand: { line: "var(--color-brand-500)", fill: "var(--color-brand-500)", dot: "var(--color-brand-600)" },
  flame: { line: "var(--color-flame-500)", fill: "var(--color-flame-500)", dot: "var(--color-flame-600)" },
} as const;

export default function TrendChart({
  points,
  tone = "brand",
  unit = "",
  label,
}: {
  points: TrendPoint[];
  tone?: keyof typeof TONE;
  unit?: string;
  /** 화면 낭독기용 설명 */
  label: string;
}) {
  const color = TONE[tone];
  const max = niceMax(Math.max(...points.map((p) => p.value), 0));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const xy = points.map((p, i) => ({
    x: PAD.left + i * stepX,
    y: PAD.top + innerH - (p.value / max) * innerH,
  }));

  const line = smoothPath(xy);
  const area = `${line} L${(PAD.left + innerW).toFixed(1)},${PAD.top + innerH} L${PAD.left},${PAD.top + innerH} Z`;

  const ticks = [0, 0.5, 1].map((r) => ({
    y: PAD.top + innerH - r * innerH,
    value: Math.round(max * r),
  }));

  const last = points.at(-1);
  const gradId = `trend-${tone}`;

  /* 마우스가 짚은 날과 말풍선을 놓을 자리(px). 선에서 멀면 null 이다. */
  const [hover, setHover] = useState<{ index: number; left: number } | null>(null);

  const pickDay = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const ctm = svg.getScreenCTM();
    if (!ctm || points.length === 0 || stepX === 0) return;

    /*
      화면 좌표를 그림 좌표로 옮긴다.
      viewBox 비율과 실제 칸 비율이 다르면 위아래에 여백이 생기므로,
      폭으로 나누는 어림셈은 어긋난다. SVG 가 쥐고 있는 변환을 그대로 쓴다.
    */
    const at = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());

    /*
      선 위에 있을 때만 띄운다. 그래프 안이라고 아무 데서나 뜨면
      빈 곳을 지나가도 말풍선이 따라다녀 성가시다.
    */
    const picked = pickPoint(at, xy, stepX);
    if (!picked?.near) {
      setHover(null);
      return;
    }

    /* 말풍선은 마우스가 아니라 그날의 점에 붙인다 */
    const dot = new DOMPoint(xy[picked.index].x, xy[picked.index].y).matrixTransform(ctm);
    setHover({ index: picked.index, left: dot.x - svg.getBoundingClientRect().left });
  };

  const active = hover?.index ?? null;
  const hot = active === null ? null : points[active];

  return (
    <figure className="relative mt-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[200px] w-full"
        onMouseMove={pickDay}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`${label}. 최근 ${points.length}일, 가장 높은 날 ${Math.max(...points.map((p) => p.value))}${unit}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color.fill} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color.fill} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* 가로 눈금 */}
        {ticks.map((t) => (
          <g key={t.value}>
            <line
              x1={PAD.left}
              y1={t.y}
              x2={W - PAD.right}
              y2={t.y}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
            <text
              x={PAD.left - 10}
              y={t.y + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--color-ink-400)"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {t.value.toLocaleString()}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gradId})`} />
        <path d={line} fill="none" stroke={color.line} strokeWidth="2" strokeLinejoin="round" />

        {/* 마우스가 짚은 날 — 세로 안내선과 점 */}
        {active !== null && (
          <g>
            <line
              x1={xy[active].x}
              y1={PAD.top}
              x2={xy[active].x}
              y2={PAD.top + innerH}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
            <circle cx={xy[active].x} cy={xy[active].y} r="4.5" fill="#fff" />
            <circle cx={xy[active].x} cy={xy[active].y} r="3.5" fill={color.dot} />
          </g>
        )}

        {/* 마지막 날 표시 */}
        {last && xy.length > 0 && (
          <circle cx={xy[xy.length - 1].x} cy={xy[xy.length - 1].y} r="3.5" fill={color.dot} />
        )}

        <text
          x={PAD.left}
          y={H - 6}
          fontSize="11"
          fill="var(--color-ink-400)"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {points[0]?.day}
        </text>
        <text
          x={W - PAD.right}
          y={H - 6}
          textAnchor="end"
          fontSize="11"
          fill="var(--color-ink-400)"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {last?.day}
        </text>
      </svg>

      {/*
        말풍선은 HTML 로 얹는다. SVG 안에 글자를 넣으면 그림이 늘어날 때 같이
        늘어나 글자 크기가 들쭉날쭉해진다.
        왼쪽 끝과 오른쪽 끝에서는 화면 밖으로 나가지 않게 방향을 뒤집는다.
      */}
      {hot && hover && active !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10"
          style={{
            left: hover.left,
            transform: `translateX(${active > points.length / 2 ? "-100%" : "0"})`,
            paddingLeft: active > points.length / 2 ? 0 : 10,
            paddingRight: active > points.length / 2 ? 10 : 0,
          }}
        >
          <div className="whitespace-nowrap rounded-lg bg-navy-900 px-3 py-2 text-white shadow-[0_8px_20px_-6px_rgba(6,42,85,0.5)]">
            <p className="label-mono text-brand-100/70">{hot.day}</p>
            <p className="mt-0.5 text-md font-bold tabular-nums">
              {hot.value.toLocaleString()}
              <span className="ml-0.5 text-sm font-medium text-brand-100/70">{unit}</span>
            </p>
          </div>
        </div>
      )}
    </figure>
  );
}

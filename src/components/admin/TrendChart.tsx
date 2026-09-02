/*
  일별 추이 꺾은선.
  라이브러리를 쓰지 않고 SVG 로 직접 그린다. 값이 서버에서 정해지므로 클라이언트 코드가 필요 없다.
*/

const W = 720;
const H = 200;
const PAD = { top: 14, right: 14, bottom: 26, left: 46 };

const TONE = {
  brand: { line: "var(--color-brand-500)", fill: "var(--color-brand-500)", dot: "var(--color-brand-600)" },
  flame: { line: "var(--color-flame-500)", fill: "var(--color-flame-500)", dot: "var(--color-flame-600)" },
} as const;

export type TrendPoint = { day: string; value: number };

/** 점 사이를 부드럽게 잇는다. Catmull-Rom 을 3차 베지에로 바꾼 것. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;

  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

/** 눈금은 사람이 읽기 좋은 값(1·2·5 배수)으로 올려 잡는다. */
function niceMax(value: number): number {
  if (value <= 4) return 4;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * exp;
    if (candidate >= value) return candidate;
  }
  return 10 * exp;
}

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

  return (
    <figure className="mt-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[200px] w-full"
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

        {/* 날마다 보이지 않는 과녁을 두어 마우스를 올리면 값이 뜨게 한다 */}
        {points.map((p, i) => (
          <rect
            key={p.day}
            x={xy[i].x - stepX / 2}
            y={PAD.top}
            width={Math.max(stepX, 1)}
            height={innerH}
            fill="transparent"
          >
            <title>{`${p.day} · ${p.value.toLocaleString()}${unit}`}</title>
          </rect>
        ))}

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
    </figure>
  );
}

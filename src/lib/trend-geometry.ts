/*
  추이 꺾은선의 셈.

  그리는 일(TrendChart.tsx)과 떼어 둔다. JSX 가 섞이면 검사에서 그대로 불러
  쓸 수 없고, 좌표 셈은 틀려도 눈에 잘 안 띄어 검사가 특히 필요한 부분이다.
*/

export const W = 720;
export const H = 200;
export const PAD = { top: 14, right: 14, bottom: 26, left: 46 };

/** 선에서 이만큼(그림 좌표) 안쪽일 때만 말풍선을 띄운다. 손이 조금 떨려도 잡히도록 넉넉히. */
export const NEAR_LINE = 14;

export type TrendPoint = { day: string; value: number };
export type Dot = { x: number; y: number };

/** 점 사이를 부드럽게 잇는다. Catmull-Rom 을 3차 베지에로 바꾼 것. */
export function smoothPath(pts: Dot[]): string {
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
export function niceMax(value: number): number {
  if (value <= 4) return 4;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * exp;
    if (candidate >= value) return candidate;
  }
  return 10 * exp;
}

/**
 * 마우스가 짚은 자리가 어느 날이고, 선 가까이인지 가린다.
 *
 * 여기가 틀리면 빈 곳에서도 말풍선이 뜨거나, 선 위에 올려도 뜨지 않는다.
 *
 * @param at  그림 좌표로 옮긴 마우스 자리
 * @param xy  날마다의 점
 */
export function pickPoint(
  at: Dot,
  xy: Dot[],
  stepX: number,
): { index: number; near: boolean } | null {
  if (xy.length === 0 || stepX === 0) return null;

  const clamp = (n: number) => Math.min(xy.length - 1, Math.max(0, n));
  const t = (at.x - PAD.left) / stepX;
  const index = clamp(Math.round(t));

  /* 점과 점 사이는 곧은 선으로 보고 그 높이를 견준다 */
  const i0 = clamp(Math.floor(t));
  const i1 = clamp(i0 + 1);
  const lineY = xy[i0].y + (xy[i1].y - xy[i0].y) * Math.min(1, Math.max(0, t - i0));

  return { index, near: Math.abs(at.y - lineY) <= NEAR_LINE };
}

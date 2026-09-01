/*
  소개 페이지(인사말·설립목적 및 연혁·조직도) 문구 타입.
  관리자 화면(클라이언트 컴포넌트)에서도 쓰므로 server-only 모듈과 분리한다.
*/

/** line = 한 줄 입력, multiline = 여러 줄 입력, rich = 편집기, image = 그림 한 장 */
export type TextKind = "line" | "multiline" | "rich" | "image";

export type TextField = {
  key: string;
  label: string;
  kind: TextKind;
  help?: string;
};

export type TextGroup = {
  id: string;
  title: string;
  /** 고친 결과를 확인할 실제 화면 */
  href: string;
  fields: TextField[];
};

/* 관리자 화면은 이 목록을 그대로 그린다. 문구를 늘리려면 여기에 한 줄 더한다. */
export const TEXT_GROUPS: TextGroup[] = [
  {
    id: "greeting",
    title: "인사말",
    href: "/about/greeting",
    fields: [
      { key: "greeting.desc", label: "페이지 머리 설명", kind: "line" },
      {
        key: "greeting.photo",
        label: "이사장 사진",
        kind: "image",
        help: "세로로 긴 사진(4:5)이 잘 맞습니다. 넣지 않으면 회색 자리만 나옵니다.",
      },
      { key: "greeting.slogan", label: "표어 앞부분", kind: "line" },
      {
        key: "greeting.sloganEm",
        label: "표어 강조 부분",
        kind: "line",
        help: "기울임 글씨로 이어 붙습니다.",
      },
      { key: "greeting.sloganSub", label: "표어 아래 한 줄", kind: "line" },
      {
        key: "greeting.quote",
        label: "사진 아래 인용문",
        kind: "multiline",
        help: "줄을 바꾸면 화면에서도 줄이 바뀌고, 마지막 줄은 밝은 색으로 나옵니다.",
      },
      { key: "greeting.body", label: "인사말 본문", kind: "rich" },
    ],
  },
  {
    id: "history",
    title: "설립목적 및 연혁",
    href: "/about/history",
    fields: [
      { key: "history.desc", label: "페이지 머리 설명", kind: "line" },
      { key: "history.purposeDesc", label: "설립목적 설명", kind: "multiline" },
      { key: "history.basis", label: "설립근거 본문", kind: "rich" },
    ],
  },
  {
    id: "organization",
    title: "조직도",
    href: "/about/organization",
    fields: [
      { key: "organization.desc", label: "페이지 머리 설명", kind: "line" },
      { key: "organization.deptDesc", label: "부서별 연락처 설명", kind: "multiline" },
    ],
  },
];

export const TEXT_FIELDS: TextField[] = TEXT_GROUPS.flatMap((g) => g.fields);
export const TEXT_KEYS: string[] = TEXT_FIELDS.map((f) => f.key);

/** 문구 묶음. 없는 키는 빈 값이다. */
export type PageTexts = Record<string, string>;

export type AboutCard = {
  id: number;
  section: CardSection;
  title: string;
  body: string;
  sortOrder: number;
};

export type CardSection = "purpose" | "role";

export const CARD_SECTION_LABEL: Record<CardSection, string> = {
  purpose: "설립목적",
  role: "기구별 역할",
};

export type Department = {
  id: number;
  name: string;
  tel: string;
  email: string;
  sortOrder: number;
};

export type HistoryEntry = {
  id: number;
  year: string;
  month: string;
  title: string;
  place: string;
  sortOrder: number;
};

/* 화면용 묶음 — 연도 > 월 > 항목 */
export type HistoryMonthGroup = { month: string; entries: HistoryEntry[] };
export type HistoryYearGroup = { year: string; months: HistoryMonthGroup[] };

/** 연혁 목록을 연도·월로 묶는다. 나온 차례를 그대로 지키고 흩어진 같은 연도는 합친다. */
export function groupHistory(entries: HistoryEntry[]): HistoryYearGroup[] {
  const years: HistoryYearGroup[] = [];
  const byYear = new Map<string, HistoryYearGroup>();

  for (const entry of entries) {
    let year = byYear.get(entry.year);
    if (!year) {
      year = { year: entry.year, months: [] };
      byYear.set(entry.year, year);
      years.push(year);
    }

    let month = year.months.find((m) => m.month === entry.month);
    if (!month) {
      month = { month: entry.month, entries: [] };
      year.months.push(month);
    }

    month.entries.push(entry);
  }

  return years;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import SmartLink from "./SmartLink";
import { IconPlus } from "./Icons";
import type { NoticeStatus } from "@/lib/format";

export type NewsItem = {
  id: number;
  board: string;
  boardName: string;
  /** 게시판마다 주소가 달라 서버에서 만들어 넘긴다. 산업뉴스·사업공고는 원문 주소다. */
  href: string;
  title: string;
  /** 오른쪽 끝 날짜. 보통은 등록일 'MM.DD', 사업공고는 마감일 '~MM.DD' */
  date: string;
  /** 정렬용 등록 시각 */
  createdAt: string;
  isNew: boolean;
  /** 사업공고의 접수 상태. 다른 게시판은 null */
  status: NoticeStatus | null;
};

export type NewsTab = { slug: string; name: string; href: string };

const BOARD_TONE: Record<string, string> = {
  notice: "bg-brand-50 text-brand-700",
  events: "bg-flame-100 text-flame-700",
  announce: "bg-white text-navy-900 ring-1 ring-line",
  news: "bg-surface text-ink-600",
};

const STATUS_TONE: Record<NoticeStatus, string> = {
  접수예정: "bg-white text-navy-900 ring-1 ring-line",
  접수중: "bg-brand-600 text-white",
  마감: "bg-surface text-ink-400",
};

/* 넓은 화면은 두 줄에 5건씩, 휴대폰은 한 줄에 앞의 5건만 */
const PER_TAB = 10;
const PER_COLUMN = 5;

/*
  메인 '조합 소식'. 탭 하나에 목록을 두 줄로 편다.

  알림판을 뺀 자리에 공지사항·사업공고 두 칸을 탭 없이 나란히 둬 봤는데, 행사정보·산업뉴스가
  메인에서 사라지고 줄마다 제목이 잘려 읽기 어려웠다(2026-11-03). 탭은 되살리고 폭을 다 쓴다.
  읽기 쉽게 한 것:
    - 날짜는 연도를 뺀 MM.DD (제목 자리를 넓힌다)
    - 사업공고는 등록일 대신 마감일(~MM.DD), 마감된 공고는 흐리게
    - 사업공고 탭에서는 게시판 이름 대신 접수 상태를 앞에 붙인다
    - 왼쪽 1~5, 오른쪽 6~10 차례(위에서 아래로 읽는다)
*/
export default function NewsTabs({ items, tabs }: { items: NewsItem[]; tabs: NewsTab[] }) {
  const [tab, setTab] = useState<string>("all");

  const list = (tab === "all" ? items : items.filter((i) => i.board === tab)).slice(0, PER_TAB);
  /* + 단추는 보고 있는 탭의 게시판으로. '전체'는 공지사항으로 간다 */
  const more = tabs.find((t) => t.slug === tab) ?? tabs[0];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-navy-900 lg:text-3xl">
          조합 <span className="text-brand-600">소식</span>
        </h2>

        {/*
          탭이 늘거나 이름이 길어지면 좁은 화면에서 줄이 넘친다. 넘친 만큼 화면 전체가
          가로로 밀리므로 탭 줄 안에서만 밀리게 한다(가로 스크롤, 막대는 숨김).
        */}
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 gap-1 overflow-x-auto rounded-full bg-surface p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[{ slug: "all", name: "전체" }, ...tabs].map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setTab(t.slug)}
                aria-pressed={tab === t.slug}
                className={`shrink-0 rounded-full px-3 py-2 text-sm font-semibold transition-colors sm:px-4 ${
                  tab === t.slug ? "bg-navy-900 text-white" : "text-ink-600 hover:text-brand-600"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {more && (
            <Link
              href={more.href}
              aria-label={`${more.name} 전체 보기`}
              className="grid size-9 shrink-0 place-items-center rounded-full text-ink-400 ring-1 ring-line transition-colors hover:bg-flame-500 hover:text-white hover:ring-flame-500"
            >
              <IconPlus className="size-4" />
            </Link>
          )}
        </div>
      </div>

      {/*
        넓은 화면은 세로로 먼저 채우는 2열(grid-flow-col). 칸 사이 세로줄 대신 넉넉한 간격을 둔다.
        글이 5건 이하이면 왼쪽 열만 찬다.
      */}
      <ul className="mt-6 grid border-t-2 border-navy-900 lg:grid-flow-col lg:grid-cols-2 lg:grid-rows-5 lg:gap-x-12">
        {list.length === 0 && (
          <li className="border-b border-line py-11 text-center text-md text-ink-400 lg:col-span-2">
            등록된 소식이 없습니다.
          </li>
        )}

        {list.map((post, i) => {
          const closed = post.status === "마감";
          const badge =
            tab === "announce" && post.status
              ? { text: post.status, tone: STATUS_TONE[post.status] }
              : { text: post.boardName, tone: BOARD_TONE[post.board] ?? BOARD_TONE.news };
          return (
            <li
              key={`${post.board}-${post.id}`}
              className={`border-b border-line ${i >= PER_COLUMN ? "hidden lg:block" : ""}`}
            >
              {/*
                산업뉴스·사업공고는 원문 주소라 새 창으로 열린다(SmartLink).
                휴대폰에서는 윗줄에 게시판·날짜, 아랫줄에 제목을 폭 가득 둔다(한 줄에 몰면 제목이
                두세 글자씩 잘렸다). 넓은 화면에서는 한 줄로 늘어놓는다.
              */}
              <SmartLink
                href={post.href}
                className="group flex flex-wrap items-center gap-x-3 gap-y-1.5 py-4 sm:flex-nowrap"
              >
                <span
                  className={`inline-flex w-[4.5rem] shrink-0 justify-center rounded px-1.5 py-1 text-2xs font-bold ${badge.tone}`}
                >
                  {badge.text}
                </span>
                <span
                  className={`order-last line-clamp-2 min-w-0 basis-full text-md font-medium transition-colors group-hover:text-brand-600 sm:order-none sm:line-clamp-none sm:flex-1 sm:basis-auto sm:truncate ${
                    closed ? "text-ink-400" : "text-ink-900"
                  }`}
                >
                  {post.title}
                </span>
                <span className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0">
                  {post.isNew && <span className="label-mono text-flame-500">new</span>}
                  <span
                    className={`label-mono tabular-nums ${closed ? "text-ink-400/70" : "text-ink-400"}`}
                  >
                    {post.date}
                  </span>
                </span>
              </SmartLink>
            </li>
          );
        })}
      </ul>
    </>
  );
}

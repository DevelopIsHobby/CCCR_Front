import type { Metadata } from "next";
import Hero from "@/components/Hero";
import NewsSection from "@/components/NewsSection";
import EduSection from "@/components/EduSection";
import BannerRail from "@/components/BannerRail";
import Partners from "@/components/Partners";
import JoinUsSection from "@/components/JoinUsSection";
import { getPost, listPosts, type PostDetail } from "@/lib/db/posts";
import { getHomeCardsUpdatedAt, listHomeCards } from "@/lib/db/home-cards";
import { getApplicant } from "@/lib/db/me";
import PopupLayer from "@/components/PopupLayer";
import { listLivePopups } from "@/lib/db/popups";

/* 제목·설명은 사이트 기본값을 쓰고, 정식 주소만 알린다 */
export const metadata: Metadata = { alternates: { canonical: "/" } };

/* 슬라이드·배너는 관리자 화면(/admin)에서 고친다. */
export default async function Home() {
  const [slides, banners, bannersUpdatedAt, me, popups, recruits] = await Promise.all([
    listHomeCards("slide"),
    listHomeCards("banner"),
    getHomeCardsUpdatedAt("banner"),
    getApplicant(),
    listLivePopups(),
    /*
      참여하기의 강사 모집 칸. 지금 모집중인 글을 마감이 가까운 차례로, 팝업에서 바로 읽게 본문까지.
      잠긴 글은 팝업에 싣지 않는다. 많아야 다섯 건만 — 그보다 많으면 팝업에서 목록으로 보낸다.
    */
    listPosts({ board: "instructors", deadline: "open" }).then(async (r) => {
      const open = r.rows.filter((p) => !p.isLocked).slice(0, 5);
      const full = await Promise.all(open.map((p) => getPost("instructors", p.id)));
      return full.filter((p): p is PostDetail => p !== null);
    }),
  ]);

  return (
    <>
      {/*
        화면에는 로고가 제목 노릇을 하므로 글자로는 두지 않는다. 다만 낱장마다
        제목이 하나는 있어야 화면 낭독기와 검색이 무엇을 보는 쪽인지 안다.
      */}
      <h1 className="sr-only">한국클라우드컴퓨팅연구조합</h1>

      <Hero slides={slides} />
      <NewsSection />
      <EduSection />
      {banners.length > 0 && <BannerRail banners={banners} updatedAt={bannersUpdatedAt} />}
      <JoinUsSection me={me} recruits={recruits} />
      <Partners />

      {/* 공지 팝업. 기간이 지난 것은 저절로 빠진다. */}
      <PopupLayer popups={popups} />
    </>
  );
}

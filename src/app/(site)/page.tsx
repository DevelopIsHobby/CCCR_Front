import Hero from "@/components/Hero";
import NewsSection from "@/components/NewsSection";
import BannerRail from "@/components/BannerRail";
import Partners from "@/components/Partners";
import JoinUsSection from "@/components/JoinUsSection";
import { getHomeCardsUpdatedAt, listHomeCards } from "@/lib/db/home-cards";
import { getApplicant } from "@/lib/db/me";
import PopupLayer from "@/components/PopupLayer";
import { listLivePopups } from "@/lib/db/popups";

/* 슬라이드·배너·알림판은 관리자 화면(/admin)에서 고친다. */
export default async function Home() {
  const [slides, banners, bannersUpdatedAt, me, popups] = await Promise.all([
    listHomeCards("slide"),
    listHomeCards("banner"),
    getHomeCardsUpdatedAt("banner"),
    getApplicant(),
    listLivePopups(),
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
      {banners.length > 0 && <BannerRail banners={banners} updatedAt={bannersUpdatedAt} />}
      <JoinUsSection me={me} />
      <Partners />

      {/* 공지 팝업. 기간이 지난 것은 저절로 빠진다. */}
      <PopupLayer popups={popups} />
    </>
  );
}

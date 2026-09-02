import Hero from "@/components/Hero";
import NewsSection from "@/components/NewsSection";
import BannerRail from "@/components/BannerRail";
import Partners from "@/components/Partners";
import JoinUsSection from "@/components/JoinUsSection";
import { getHomeCardsUpdatedAt, listHomeCards } from "@/lib/db/home-cards";

/* 슬라이드·배너·알림판은 관리자 화면(/admin)에서 고친다. */
export default async function Home() {
  const [slides, banners, bannersUpdatedAt] = await Promise.all([
    listHomeCards("slide"),
    listHomeCards("banner"),
    getHomeCardsUpdatedAt("banner"),
  ]);

  return (
    <>
      <Hero slides={slides} />
      <NewsSection />
      {banners.length > 0 && <BannerRail banners={banners} updatedAt={bannersUpdatedAt} />}
      <JoinUsSection />
      <Partners />
    </>
  );
}

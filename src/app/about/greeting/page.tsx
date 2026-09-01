import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { Prose, ContactBanner } from "@/components/sub/Ui";
import { getPageTexts } from "@/lib/db/about-content";
import { getSiteSettings } from "@/lib/db/site-settings";

export const metadata: Metadata = { title: "인사말" };

/** 이름 사이를 띄운다. 서명은 "이 동 기" 처럼 보이는 것이 관례다. */
const spaced = (name: string) => [...name].join(" ");

export default async function Page() {
  const [texts, site] = await Promise.all([getPageTexts(), getSiteSettings()]);

  const quote = (texts["greeting.quote"] ?? "").split(/\r?\n/).filter(Boolean);

  return (
    <PageShell href="/about/greeting" desc={texts["greeting.desc"]}>
      {/* 조합 표어 */}
      <div className="border-b border-line pb-10">
        <p className="text-xl font-bold leading-snug text-navy-900 lg:text-2xl">
          {texts["greeting.slogan"]}{" "}
          <span className="italic text-brand-600">{texts["greeting.sloganEm"]}</span>
        </p>
        <p className="mt-3 text-md text-ink-600">{texts["greeting.sloganSub"]}</p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[340px_1fr] lg:gap-16">
        {/* 좌: 이사장 */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            {/* 이사장 사진으로 교체 */}
            <div className="grid aspect-[4/5] place-items-center bg-white">
              <span className="label-mono text-ink-400">이사장 사진</span>
            </div>
            <div className="border-t border-line px-6 py-5">
              <p className="text-sm text-ink-600">한국클라우드컴퓨팅연구조합</p>
              <p className="mt-1.5 text-lg font-bold text-navy-900">
                이사장 <span className="ml-1 tracking-[0.15em]">{site.chairman}</span>
              </p>
            </div>
          </div>

          {quote.length > 0 && (
            <p className="mt-6 rounded-xl bg-navy-900 px-6 py-7 text-lg font-bold leading-relaxed text-white">
              {quote.map((line, i) => (
                <span key={line} className={i === quote.length - 1 ? "text-brand-200" : undefined}>
                  {i === 0 ? "“" : null}
                  {line}
                  {i === quote.length - 1 ? "”" : null}
                  {i < quote.length - 1 && <br />}
                </span>
              ))}
            </p>
          )}
        </div>

        {/* 우: 인사말 본문 */}
        <div>
          <Prose html={texts["greeting.body"] ?? ""} />

          <div className="mt-12 border-t border-line pt-8 text-right">
            <p className="text-md text-ink-600">
              한국클라우드컴퓨팅연구조합
              <span className="ml-4 font-bold text-navy-900">
                이사장 <span className="ml-1 tracking-[0.2em]">{spaced(site.chairman)}</span>
              </span>
            </p>
          </div>
        </div>
      </div>

      <ContactBanner
        title="조합과 함께하실 기업을 기다립니다"
        desc="회원사 가입 절차와 혜택을 안내해 드립니다."
        href="/members/join"
        cta="회원사 가입안내"
      />
    </PageShell>
  );
}

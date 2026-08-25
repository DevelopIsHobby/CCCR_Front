import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { Prose, ContactBanner } from "@/components/sub/Ui";

export const metadata: Metadata = { title: "인사말" };

export default function Page() {
  return (
    <PageShell
      href="/about/greeting"
      desc="한국클라우드컴퓨팅연구조합을 찾아주셔서 감사합니다."
    >
      <div className="grid gap-12 lg:grid-cols-[380px_1fr] lg:gap-16">
        {/* 좌: 이사장 카드 */}
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-8">
            <div className="relative">
              {/* 실제 이사장 사진으로 교체 */}
              <div className="grid aspect-[4/5] place-items-center rounded-xl border border-white/15 bg-white/5">
                <span className="label-mono text-brand-100/40">Photo</span>
              </div>
              <p className="mt-6 text-sm text-brand-100/60">한국클라우드컴퓨팅연구조합</p>
              <p className="mt-1 text-xl font-bold text-white">
                이사장 <span className="ml-1">홍 길 동</span>
              </p>
            </div>
          </div>
        </div>

        {/* 우: 인사말 본문 */}
        <div>
          <p className="text-2xl font-bold leading-[1.5] text-navy-900 lg:text-3xl">
            클라우드는 이제 산업의 선택이 아니라
            <br />
            <span className="text-brand-600">모든 혁신이 놓이는 바닥</span>이 되었습니다.
          </p>

          <div className="mt-10">
            <Prose>
              <p>
                안녕하십니까. 한국클라우드컴퓨팅연구조합 홈페이지를 찾아주신 여러분께 깊이 감사드립니다.
              </p>
              <p>
                우리 조합은 2015년 설립 이후 클라우드컴퓨팅 분야의 공동 연구개발과 전문인력 양성을
                목표로 활동해 왔습니다. 인공지능이 산업 전반으로 확산되면서 클라우드는 이제 데이터와
                연산이 만나는 <b>산업의 기반 인프라</b>로 자리 잡았습니다. 그만큼 기술의 난이도와
                투자 규모도 개별 기업이 홀로 감당하기 어려운 수준에 이르렀습니다.
              </p>
              <p>
                연구조합이 존재하는 이유가 바로 여기에 있습니다. 회원사가 각자 부담하기 어려운 과제를
                함께 기획하고, 국가 연구개발사업과 연계해 위험을 나누며, 그 결과를 산업 전체가 활용할
                수 있도록 만드는 일. 조합은 이 역할을 성실히 수행하겠습니다.
              </p>
              <p>
                아울러 <b>현장이 필요로 하는 인력</b>을 길러내는 일에도 힘쓰겠습니다. AI 데이터센터
                설계와 운영, GPU 자원 최적화처럼 수요는 빠르게 늘지만 경험을 갖춘 인력은 부족한
                영역에서, 조합의 교육사업이 산업과 인재를 잇는 다리가 되도록 하겠습니다.
              </p>
              <p>
                클라우드컴퓨팅산업이 4차 산업 및 지능정보사회로의 도약에 기여할 수 있도록, 회원사
                여러분과 함께 걸어가겠습니다. 많은 관심과 참여를 부탁드립니다.
              </p>
              <p>감사합니다.</p>
            </Prose>
          </div>

          <div className="mt-12 border-t border-line pt-8 text-right">
            <p className="text-md text-ink-600">한국클라우드컴퓨팅연구조합</p>
            <p className="mt-2 text-lg font-bold text-navy-900">
              이사장 <span className="ml-2 tracking-[0.2em]">홍 길 동</span>
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

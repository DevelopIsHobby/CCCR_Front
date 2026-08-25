import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { Prose, ContactBanner } from "@/components/sub/Ui";

export const metadata: Metadata = { title: "인사말" };

export default function Page() {
  return (
    <PageShell
      href="/about/greeting"
      desc="한국클라우드컴퓨팅연구조합 홈페이지를 찾아주셔서 감사합니다."
    >
      {/* 조합 표어 */}
      <div className="border-b border-line pb-10">
        <p className="text-xl font-bold leading-snug text-navy-900 lg:text-2xl">
          고객과 함께하는{" "}
          <span className="italic text-brand-600">Consortium of World-Class Research</span>
        </p>
        <p className="mt-3 text-md text-ink-600">
          한국 클라우드 컴퓨팅이 세계적인 수준으로 도약할 수 있도록 최선을 다하겠습니다.
        </p>
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
                이사장 <span className="ml-1 tracking-[0.15em]">이동기</span>
              </p>
            </div>
          </div>

          <p className="mt-6 rounded-xl bg-navy-900 px-6 py-7 text-lg font-bold leading-relaxed text-white">
            “한국클라우드컴퓨팅연구조합
            <br />
            홈페이지 방문을
            <br />
            <span className="text-brand-200">환영합니다.”</span>
          </p>
        </div>

        {/* 우: 인사말 본문 */}
        <div>
          <Prose>
            <p>
              안녕하십니까?
              <br />
              한국클라우드컴퓨팅연구조합 이사장 이동기입니다.
            </p>
            <p>저희 홈페이지를 찾아 주신 여러분을 진심으로 환영합니다.</p>
            <p>
              우리 연구조합은 <b>2009년 ‘산업기술연구조합육성법’</b>에 근거하여 지식경제부 인가로
              설립되었으며, 지난 10년간 클라우드 컴퓨팅 분야의 핵심기술 개발 및 산업계 공통
              애로기술 등의 기술적 과제를 상호 협동하여 해결하고, 클라우드 컴퓨팅 전문인력 양성 등을
              통해 국가 경쟁력 강화를 위해 정진해 왔습니다.
            </p>
            <p>
              주요 사업으로 클라우드 컴퓨팅 기술 스택 개발 및 배포를 통해 국가 R&amp;D 과제를
              추진하고 표준화를 지원하였으며, 또한, 클라우드 컴퓨팅 인력양성 로드맵을 개발하여, 이를
              기반으로 산업계에서 필요한 신규 인력 양성 및 재직자 대상 기술 재교육 등을 실시함으로써
              기업 경쟁력 강화에 기여 하였습니다. 아울러, 클라우드 컴퓨팅 기술 및 인력 등에 대한
              다양한 행사 등을 개최하여 최신 기술 트렌드 공유와 인력 교류 등을 추진해 왔습니다.
            </p>
            <p>
              앞으로도 클라우드 컴퓨팅은 4차 산업혁명의 핵심기술을 융합하고 데이터 시대의 필수
              플랫폼으로써, 기업의 비즈니스 혁신을 위한 디지털 트랜스포메이션과 ICT 신산업의 성장 및
              Globalization 가속화를 위해 빠르게 성장할 기술 분야가 될 것이며, 이에 우리 연구조합은
              이러한 시대적인 흐름에 발맞추어 <b>항상 열린 마음으로 여러분의 목소리에 귀를 기울여</b>{" "}
              국내 클라우드 컴퓨팅 산업 발전에 이바지 할 수 있도록 최선을 다하겠습니다.
            </p>
            <p>
              아낌없는 관심과 성원을 부탁드립니다.
              <br />
              감사합니다.
            </p>
          </Prose>

          <div className="mt-12 border-t border-line pt-8 text-right">
            <p className="text-md text-ink-600">
              한국클라우드컴퓨팅연구조합
              <span className="ml-4 font-bold text-navy-900">
                이사장 <span className="ml-1 tracking-[0.2em]">이 동 기</span>
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

import type { Metadata } from "next";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading } from "@/components/sub/Ui";
import RecruitContact from "@/components/RecruitContact";
import { pageMeta } from "@/lib/page-meta";
import { RECRUIT_NOTE } from "@/lib/recruit";

export const metadata: Metadata = pageMeta("강사 모집", "/participate/instructors", RECRUIT_NOTE);

/*
  참여하기 → 강사 모집. 게시판 없이 상시 모집 안내와 메일 칸만 둔다.
  메인 참여하기의 팝업(RecruitDialog)과 같은 말·주소를 쓴다(lib/recruit.ts).
  주소가 있어 강사로 모실 분께 링크로 보내 드릴 수 있다.
*/
export default function Page() {
  return (
    <PageShell href="/participate/instructors" desc="조합 교육·세미나의 강사를 상시 모집합니다.">
      <SectionHeading eyebrow="상시 모집" title="조합 교육의 강사가 되어 주세요" desc={RECRUIT_NOTE} />

      <div className="mt-10 max-w-xl rounded-xl border border-line bg-white p-6 lg:p-7">
        <RecruitContact />
      </div>
    </PageShell>
  );
}

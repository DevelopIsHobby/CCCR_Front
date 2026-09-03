import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading } from "@/components/sub/Ui";
import RequestStatusCard from "@/components/RequestStatusCard";
import { findRequestByToken } from "@/lib/db/requests";

/* 남의 신청을 들여다볼 수 있는 주소라 검색에 잡히면 안 된다. */
export const metadata: Metadata = {
  title: "신청 현황",
  robots: { index: false, follow: false, nocache: true },
};

/*
  메일의 '진행 상황' 링크로 들어오는 화면.
  토큰만으로 한 건을 보여 준다. 신청자가 접수번호를 옮겨 적지 않아도 되게 하려는 것이다.
*/
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const req = await findRequestByToken(token);

  return (
    <PageShell
      href="/participate/status"
      title="신청 현황"
      category="참여하기"
      desc={req ? `${req.kindLabel} · ${req.ref}` : "신청 처리 상황을 확인하실 수 있습니다."}
    >
      {req ? (
        <>
          <SectionHeading
            eyebrow={req.kindLabel}
            title="신청 현황"
            desc={`${req.name}님이 넣으신 신청의 처리 상황입니다.`}
          />
          <div className="mt-10">
            <RequestStatusCard req={req} />
          </div>
        </>
      ) : (
        <>
          <SectionHeading
            eyebrow="참여하기"
            title="신청을 찾지 못했습니다"
            desc="주소가 잘못되었거나, 신청이 지워졌을 수 있습니다."
          />
          <p className="mt-10 rounded-xl border border-line bg-surface px-5 py-4 text-base leading-relaxed text-ink-600 lg:px-6">
            메일의 링크를 그대로 눌러 주세요. 링크가 잘려서 열렸을 수 있습니다. 그래도 열리지
            않으면 접수번호로 찾아보실 수 있습니다.
          </p>
        </>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/participate/status"
          className="rounded-full border border-line bg-white px-5 py-2.5 text-base font-bold text-navy-900 transition-colors hover:border-brand-500 hover:text-brand-600"
        >
          접수번호로 찾기
        </Link>
        <Link
          href="/"
          className="rounded-full px-5 py-2.5 text-base font-bold text-ink-600 transition-colors hover:text-brand-600"
        >
          홈으로
        </Link>
      </div>

      <p className="mt-12 rounded-xl border border-line bg-surface px-5 py-4 text-base leading-relaxed text-ink-600 lg:px-6">
        궁금한 점은 사무국(support@cccr.or.kr)으로 연락해 주세요.
      </p>
    </PageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading } from "@/components/sub/Ui";
import RequestLookupForm from "@/components/RequestLookupForm";
import RequestStatusCard from "@/components/RequestStatusCard";
import { getSession } from "@/lib/auth/session";
import { listMyRequests } from "@/lib/db/requests";
import { mailFrom } from "@/lib/mail/address";

export const metadata: Metadata = {
  title: "신청 현황 조회",
  robots: { index: false, follow: false },
};

/*
  신청 현황 조회.

  로그인을 강제하지 않기로 했으므로 두 갈래를 둔다.
  - 로그인: 넣으신 신청을 모두 보여 준다. 접수번호가 필요 없다.
  - 그 밖: 접수번호와 이메일로 한 건씩 찾는다. 메일 링크로 들어오면 바로 열린다.
*/
export default async function Page() {
  const session = await getSession();
  const mine = session ? await listMyRequests(session.userId, session.email) : [];

  return (
    <PageShell
      href="/participate/status"
      desc="넣으신 신청이 어떻게 처리되고 있는지 확인하실 수 있습니다."
    >
      <SectionHeading
        eyebrow="참여하기"
        title="신청 현황 조회"
        desc="접수 확인 메일에 적힌 접수번호와 이메일을 넣으시면 됩니다."
      />

      {/* 접수번호로 찾기 — 이 화면의 본론이라 맨 위에 둔다 */}
      <div className="mt-10">
        <RequestLookupForm defaultEmail={session?.email ?? ""} />
      </div>

      {session && (
        <section className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-navy-900 pb-4">
            <h3 className="text-xl font-bold text-navy-900">내 신청 내역</h3>
            <p className="data-line text-ink-400">{mine.length}건</p>
          </div>

          {mine.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-line bg-surface px-6 py-10 text-center text-md text-ink-400">
              아직 넣으신 신청이 없습니다.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {mine.map((req) => (
                <RequestStatusCard key={`${req.kind}-${req.ref}`} req={req} />
              ))}
            </div>
          )}
        </section>
      )}

      <p className="mt-12 rounded-xl border border-line bg-surface px-5 py-4 text-base leading-relaxed text-ink-600 lg:px-6">
        {!session && (
          <>
            <Link
              href="/login?next=/participate/status"
              className="font-bold text-brand-600 hover:underline"
            >
              로그인
            </Link>
            하시면 접수번호 없이도 넣으신 신청을 한눈에 보실 수 있습니다.{" "}
          </>
        )}
        접수 확인 메일을 못 받으셨거나 접수번호를 잊으셨으면 사무국({mailFrom()})으로 연락해
        주세요.
      </p>
    </PageShell>
  );
}

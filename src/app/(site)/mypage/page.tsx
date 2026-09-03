import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading } from "@/components/sub/Ui";
import RequestStatusCard from "@/components/RequestStatusCard";
import { NameForm, OtherDevicesForm, PasswordForm } from "@/components/admin/AccountForms";
import { getSession } from "@/lib/auth/session";
import { countMySessions } from "@/lib/db/account-actions";
import { listRequestsByEmail } from "@/lib/db/requests";
import { USER_STATUS_LABEL, type UserStatus } from "@/lib/user-types";
import { ready } from "@/lib/db/migrate";

export const metadata: Metadata = {
  title: "마이페이지",
  robots: { index: false, follow: false },
};

/*
  마이페이지.

  신청 현황과 계정 정보를 한 곳에 둔다. 로그인한 사람이 자기 것을 확인하고
  고치는 자리라, 헤더의 이름을 누르면 여기로 온다.
  신청 조회는 참여하기 쪽에도 있지만 그쪽은 로그인 없이 접수번호로 찾는 길이다.
*/
export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login?next=/mypage");

  const db = await ready();
  const [me, requests, sessionCount] = await Promise.all([
    db.get<{ company: string | null; department: string | null; status: string }>(
      "SELECT company, department, status FROM users WHERE id = ?",
      [session.userId],
    ),
    listRequestsByEmail(session.email),
    countMySessions(),
  ]);

  const statusLabel = USER_STATUS_LABEL[me?.status as UserStatus] ?? me?.status ?? "";

  return (
    <PageShell
      href="/mypage"
      title="마이페이지"
      category="내 정보"
      desc="넣으신 신청과 계정 정보를 확인하고 고칠 수 있습니다."
    >
      <SectionHeading
        eyebrow={session.email}
        title={`${session.name}님`}
        desc="신청 현황과 계정 정보를 한 곳에서 보실 수 있습니다."
      />

      {/* 계정 요약 */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "소속", value: me?.company || "—" },
          { label: "부서", value: me?.department || "—" },
          { label: "회원 상태", value: statusLabel },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-line bg-surface p-5">
            <p className="text-base text-ink-400">{item.label}</p>
            <p className="mt-1.5 text-md font-bold text-navy-900">{item.value}</p>
          </div>
        ))}
      </div>

      {session.role === "admin" && (
        <p className="mt-4 rounded-xl border border-line bg-white px-5 py-4 text-base text-ink-600 lg:px-6">
          관리자 계정입니다.{" "}
          <Link href="/admin" className="font-bold text-brand-600 hover:underline">
            관리자 화면
          </Link>
          에서 홈페이지를 관리하실 수 있습니다.
        </p>
      )}

      {/* 신청 현황 */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-navy-900 pb-4">
          <h3 className="text-xl font-bold text-navy-900">내 신청 현황</h3>
          <p className="data-line text-ink-400">{requests.length}건</p>
        </div>

        {requests.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
            <p className="text-md text-ink-400">이 주소로 넣으신 신청이 아직 없습니다.</p>
            <p className="mt-2 text-base text-ink-400">
              다른 주소로 신청하셨다면{" "}
              <Link
                href="/participate/status"
                className="font-bold text-brand-600 hover:underline"
              >
                접수번호로 찾기
              </Link>
              를 쓰세요.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {requests.map((req) => (
              <RequestStatusCard key={`${req.kind}-${req.ref}`} req={req} />
            ))}
          </div>
        )}
      </section>

      {/* 계정 정보 */}
      <section className="mt-16">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          표시 이름
        </h3>
        <NameForm name={session.name} />
      </section>

      <section className="mt-14">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          비밀번호 변경
        </h3>
        <p className="mt-4 text-base leading-relaxed text-ink-600">
          바꾸면 지금 기기를 뺀 다른 기기의 로그인은 모두 끊어집니다.
        </p>
        <PasswordForm />
      </section>

      <section className="mt-14">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          로그인한 기기
        </h3>
        <OtherDevicesForm count={sessionCount} />
      </section>

      <p className="mt-14 rounded-xl border border-line bg-surface px-5 py-4 text-base leading-relaxed text-ink-600 lg:px-6">
        소속·부서·이메일을 바꾸시려면 사무국으로 알려 주세요. 회원 정보는 사무국에서
        확인한 뒤 고쳐 드립니다.
      </p>
    </PageShell>
  );
}

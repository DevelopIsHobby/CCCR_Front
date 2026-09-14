import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading } from "@/components/sub/Ui";
import { NameForm, OtherDevicesForm, PasswordForm } from "@/components/admin/AccountForms";
import { getSession } from "@/lib/auth/session";
import { countMySessions } from "@/lib/db/account-actions";
import { USER_STATUS_LABEL, type UserStatus } from "@/lib/user-types";
import { ready } from "@/lib/db/migrate";

export const metadata: Metadata = {
  title: "마이페이지",
  robots: { index: false, follow: false },
};

/*
  마이페이지.

  계정 정보를 한 곳에 둔다. 로그인한 사람이 자기 것을 확인하고
  고치는 자리라, 헤더의 이름을 누르면 여기로 온다.
*/
export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login?next=/mypage");

  const db = await ready();
  const [me, sessionCount] = await Promise.all([
    db.get<{ company: string | null; department: string | null; status: string }>(
      "SELECT company, department, status FROM users WHERE id = ?",
      [session.userId],
    ),
    countMySessions(),
  ]);

  const statusLabel = USER_STATUS_LABEL[me?.status as UserStatus] ?? me?.status ?? "";

  return (
    <PageShell
      href="/mypage"
      title="마이페이지"
      category="내 정보"
      desc="계정 정보를 확인하고 고칠 수 있습니다."
    >
      <SectionHeading
        eyebrow={session.email}
        title={`${session.name}님`}
        desc="계정 정보를 한 곳에서 보실 수 있습니다."
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

      {/* 계정 정보 */}
      <section className="mt-12">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          표시 이름
        </h3>
        <NameForm name={session.name} />
      </section>

      <section className="mt-11">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          비밀번호 변경
        </h3>
        <p className="mt-4 text-base leading-relaxed text-ink-600">
          바꾸면 지금 기기를 뺀 다른 기기의 로그인은 모두 끊어집니다.
        </p>
        <PasswordForm />
      </section>

      <section className="mt-11">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          로그인한 기기
        </h3>
        <OtherDevicesForm count={sessionCount} />
      </section>

      <p className="mt-11 rounded-xl border border-line bg-surface px-5 py-4 text-base leading-relaxed text-ink-600 lg:px-6">
        소속·부서·이메일을 바꾸시려면 사무국으로 알려 주세요. 회원 정보는 사무국에서
        확인한 뒤 고쳐 드립니다.
      </p>
    </PageShell>
  );
}

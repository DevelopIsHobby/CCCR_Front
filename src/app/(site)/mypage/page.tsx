import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageShell from "@/components/sub/PageShell";
import { SectionHeading } from "@/components/sub/Ui";
import RequestStatusCard from "@/components/RequestStatusCard";
import { NameForm, OtherDevicesForm, PasswordForm } from "@/components/admin/AccountForms";
import { NewsletterPrefForm, NoticePrefForm, WithdrawForm } from "@/components/MyAccountForms";
import { getSession } from "@/lib/auth/session";
import { countMySessions } from "@/lib/db/account-actions";
import { getMyMailPrefs } from "@/lib/db/mail-prefs";
import { listMyRequests } from "@/lib/db/requests";
import { USER_STATUS_LABEL, type UserStatus } from "@/lib/user-types";
import { ready } from "@/lib/db/migrate";
import { SocialIcon } from "@/components/SocialIcons";
import { SOCIAL_LABEL, isSocialProvider, type SocialProvider } from "@/lib/auth/social-profile";

/* 소셜 서비스 딱지 색. 각 서비스 로그인 버튼 안내를 따른다(SocialLoginButtons 와 같다). */
const SOCIAL_BADGE: Record<SocialProvider, string> = {
  kakao: "bg-[#FEE500] text-black",
  naver: "bg-[#03C75A] text-white",
  google: "bg-white ring-1 ring-[#DADCE0]",
};

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
  const [me, requests, sessionCount, identities, mailPrefs] = await Promise.all([
    db.get<{ company: string | null; department: string | null; status: string; has_password: number }>(
      "SELECT company, department, status, CASE WHEN password_hash = '' THEN 0 ELSE 1 END AS has_password FROM users WHERE id = ?",
      [session.userId],
    ),
    listMyRequests(session.userId, session.email),
    countMySessions(),
    db.all<{ provider: string }>(
      "SELECT provider FROM user_identities WHERE user_id = ? ORDER BY id",
      [session.userId],
    ),
    getMyMailPrefs(session.userId, session.email),
  ]);

  /* 소셜 로그인으로만 가입한 계정은 비밀번호가 비어 있다 */
  const hasPassword = Number(me?.has_password ?? 1) === 1;
  const socialProviders = identities.map((row) => row.provider).filter(isSocialProvider);

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
      <section className="mt-11">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-navy-900 pb-4">
          <h3 className="text-xl font-bold text-navy-900">내 신청 현황</h3>
          {/* 어느 주소를 기준으로 모은 것인지 밝힌다. 안 보이면 왜 없는지 알 수 없다. */}
          <p className="data-line text-ink-400">
            {session.email} 기준 · {requests.length}건
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-line bg-surface px-6 py-10 text-center">
            <p className="text-md text-ink-600">
              <b className="font-bold text-navy-900">{session.email}</b> 로 넣으신 신청이 아직
              없습니다.
            </p>
            <p className="mt-3 text-base leading-relaxed text-ink-600">
              신청서에 이 주소가 아닌 다른 주소를 적으셨다면 여기에 나오지 않습니다.
              <br />
              접수 확인 메일의 접수번호로{" "}
              <Link
                href="/participate/status"
                className="font-bold text-brand-600 hover:underline"
              >
                직접 찾으실 수 있습니다
              </Link>
              .
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
      <section className="mt-12">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          표시 이름
        </h3>
        <NameForm name={session.name} />
      </section>

      {socialProviders.length > 0 && (
        <section className="mt-11">
          <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
            연결된 소셜 계정
          </h3>
          <ul className="mt-5 flex flex-wrap gap-2">
            {socialProviders.map((provider) => (
              <li
                key={provider}
                className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 text-base font-bold text-navy-900"
              >
                <span className={`grid size-7 place-items-center rounded-full ${SOCIAL_BADGE[provider]}`}>
                  <SocialIcon provider={provider} className="size-3.5" />
                </span>
                {SOCIAL_LABEL[provider]} 로그인
              </li>
            ))}
          </ul>
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            로그인 화면에서 이 서비스 단추를 누르면 비밀번호 없이 들어오실 수 있습니다.
          </p>
        </section>
      )}

      <section className="mt-11">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          {hasPassword ? "비밀번호 변경" : "비밀번호 만들기"}
        </h3>
        {hasPassword ? (
          <>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              바꾸면 지금 기기를 뺀 다른 기기의 로그인은 모두 끊어집니다.
            </p>
            <PasswordForm />
          </>
        ) : (
          /* 소셜로만 가입해 비밀번호가 없다. 지금 비밀번호를 묻는 변경 칸은 쓸 수 없으므로 비밀번호 찾기로 만들게 한다. */
          <div className="mt-5 rounded-xl border border-line bg-surface px-5 py-5 lg:px-6">
            <p className="text-base leading-relaxed text-ink-600">
              소셜 로그인으로 가입하셔서 아직 비밀번호가 없습니다. 이메일로도 로그인하고 싶으시면
              비밀번호 찾기에서 <b className="font-bold text-navy-900">{session.email}</b> 로 링크를 받아
              비밀번호를 만들어 주세요.
            </p>
            <Link
              href="/reset"
              className="mt-4 inline-flex rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600"
            >
              비밀번호 만들기
            </Link>
          </div>
        )}
      </section>

      <section className="mt-11">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">
          로그인한 기기
        </h3>
        <OtherDevicesForm count={sessionCount} />
      </section>

      {/*
        메일 수신. 이용약관 제12조(회원정보수정 메뉴에서 정보수신거부)를 지키는 자리다.
        계정 이메일을 기준으로 보여 주고 바꾼다.
      */}
      <section className="mt-11">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">메일 수신</h3>
        <div className="mt-6 space-y-4">
          <NewsletterPrefForm subscribed={mailPrefs.newsletter} email={session.email} />
          <NoticePrefForm status={mailPrefs.notice} />
        </div>
      </section>

      <p className="mt-11 rounded-xl border border-line bg-surface px-5 py-4 text-base leading-relaxed text-ink-600 lg:px-6">
        소속·부서·이메일을 바꾸시려면 사무국으로 알려 주세요. 회원 정보는 사무국에서
        확인한 뒤 고쳐 드립니다.
      </p>

      {/* 회원 탈퇴. 이용약관 제5조(요청하면 즉시 말소). 가장 아래에 둔다. */}
      <section className="mt-14">
        <h3 className="border-b-2 border-navy-900 pb-4 text-xl font-bold text-navy-900">회원 탈퇴</h3>
        <WithdrawForm email={session.email} isAdmin={session.role === "admin"} />
      </section>
    </PageShell>
  );
}

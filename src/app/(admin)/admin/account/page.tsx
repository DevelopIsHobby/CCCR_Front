import type { Metadata } from "next";
import Link from "next/link";
import { NameForm, OtherDevicesForm, PasswordForm } from "@/components/admin/AccountForms";
import { Note, PageHead, Panel } from "@/components/admin/AdminUi";
import { countMySessions } from "@/lib/db/account-actions";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "계정 보안" };

export default async function Page() {
  const [session, sessionCount] = await Promise.all([getSession(), countMySessions()]);

  return (
    <div className="space-y-6">
      <PageHead
        title="계정 보안"
        desc={`지금 로그인한 계정(${session?.email})의 비밀번호와 이름을 바꿉니다.`}
      />

      <Panel title="비밀번호 변경">
        <p className="text-base leading-relaxed text-ink-600">
          바꾸면 지금 기기를 뺀 다른 기기의 로그인은 모두 끊어집니다. 비밀번호를 잊었을 때는
          서버에서
          <code className="mx-1.5 rounded bg-surface px-1.5 py-0.5 text-sm">
            node scripts/create-admin.mjs
          </code>
          로 다시 정할 수 있습니다.
        </p>
        <PasswordForm />
      </Panel>

      <Panel title="로그인한 기기">
        <OtherDevicesForm count={sessionCount} />
      </Panel>

      <Panel title="표시 이름">
        <NameForm name={session?.name ?? ""} />
      </Panel>

      <Note>
        다른 사람에게 관리자 권한을 주거나 새 관리자 계정을 만들려면{" "}
        <Link href="/admin/members" className="font-bold text-brand-600 hover:underline">
          회원 관리
        </Link>
        에서 하세요.
      </Note>
    </div>
  );
}

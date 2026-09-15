"use client";

import Link from "next/link";
import { useActionState } from "react";
import ConsentCheck from "@/components/ConsentCheck";
import {
  setMyNewsletter,
  stopMyNotice,
  withdrawMe,
  type MembershipState,
} from "@/lib/db/membership-actions";

/* 마이페이지의 다른 칸(AccountForms)과 같은 모양 */
const input =
  "w-full rounded-md border border-line px-4 py-3 text-md outline-none transition-colors focus:border-brand-500";
const primaryBtn =
  "rounded-full bg-navy-900 px-6 py-2.5 text-base font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-60";
const dangerBtn =
  "rounded-full px-5 py-2.5 text-base font-bold text-flame-700 ring-1 ring-flame-500/40 transition-colors hover:bg-flame-100 disabled:opacity-60";

function Result({ state }: { state: MembershipState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-md bg-flame-100 px-4 py-3 text-base font-medium text-flame-700">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="rounded-md bg-brand-50 px-4 py-3 text-base font-medium text-brand-700">
        {state.ok}
      </p>
    );
  }
  return null;
}

/** 뉴스레터 받기·끄기 */
export function NewsletterPrefForm({ subscribed, email }: { subscribed: boolean; email: string }) {
  const [state, action, pending] = useActionState<MembershipState, FormData>(setMyNewsletter, {});

  return (
    <form action={action} className="space-y-4 rounded-xl bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-md font-bold text-navy-900">뉴스레터</p>
          <p className="mt-1 text-base text-ink-600">
            {subscribed ? (
              <>
                <b className="font-bold text-brand-600">받는 중</b> · {email} 로 월 1회 보내드립니다.
              </>
            ) : (
              "받지 않고 있습니다."
            )}
          </p>
        </div>
        {subscribed && (
          <button type="submit" name="intent" value="unsubscribe" disabled={pending} className={dangerBtn}>
            {pending ? "처리 중…" : "수신 끄기"}
          </button>
        )}
      </div>

      {!subscribed && (
        <>
          <ConsentCheck items="이메일주소" purpose="뉴스레터 발송" keep="구독 해지 시까지" />
          <div className="flex justify-end">
            <button type="submit" name="intent" value="subscribe" disabled={pending} className={primaryBtn}>
              {pending ? "처리 중…" : "뉴스레터 받기"}
            </button>
          </div>
        </>
      )}

      <Result state={state} />
    </form>
  );
}

/** 사업공고 수신 중단. 받기는 사무국 승인이 필요해 신청 화면으로 보낸다. */
export function NoticePrefForm({ status }: { status: "active" | "pending" | null }) {
  const [state, action, pending] = useActionState<MembershipState, FormData>(stopMyNotice, {});

  return (
    <form action={action} className="space-y-4 rounded-xl bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-md font-bold text-navy-900">사업공고</p>
          <p className="mt-1 text-base text-ink-600">
            {status === "active" && (
              <>
                <b className="font-bold text-brand-600">받는 중</b> · 사무국이 승인한 임원사 담당자에게 보내드립니다.
              </>
            )}
            {status === "pending" && (
              <>
                <b className="font-bold text-navy-900">승인 대기</b> · 넣으신 신청을 사무국이 확인하고 있습니다.
              </>
            )}
            {status === null && "받지 않고 있습니다. 임원사 담당자이시면 수신을 신청해 주세요."}
          </p>
        </div>

        {status === null ? (
          <Link href="/members/notice" className={primaryBtn}>
            수신 신청하기
          </Link>
        ) : (
          <button
            type="submit"
            disabled={pending}
            onClick={(e) => {
              const message =
                status === "active"
                  ? "사업공고 수신을 멈출까요? 다시 받으려면 새로 신청해 사무국 승인을 받아야 합니다."
                  : "승인 대기 중인 사업공고 수신 신청을 취소할까요?";
              if (!confirm(message)) e.preventDefault();
            }}
            className={dangerBtn}
          >
            {pending ? "처리 중…" : status === "active" ? "수신 중단" : "신청 취소"}
          </button>
        )}
      </div>

      <Result state={state} />
    </form>
  );
}

/** 회원 탈퇴. 계정 이메일을 다시 적어야 한다. */
export function WithdrawForm({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  const [state, action, pending] = useActionState<MembershipState, FormData>(withdrawMe, {});

  if (isAdmin) {
    return (
      <p className="mt-6 rounded-xl bg-surface px-6 py-5 text-base leading-relaxed text-ink-600">
        관리자 계정은 여기서 탈퇴할 수 없습니다. 마지막 관리자가 빠지면 아무도 홈페이지를 관리할 수
        없기 때문입니다. 다른 관리자에게 관리자 화면의 회원 관리에서 처리를 요청해 주세요.
      </p>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4 rounded-xl border border-flame-500/30 bg-white p-6">
      <ul className="space-y-1.5 text-base leading-relaxed text-ink-600">
        <li>· 계정과 로그인 기록, 연결된 소셜 계정이 바로 지워지며 되돌릴 수 없습니다.</li>
        <li>· 이 계정 주소로 받던 뉴스레터는 해지되고, 사업공고 수신은 멈춥니다.</li>
        <li>· 넣으신 신청 기록은 개인정보처리방침에 적은 보관 기간이 지나면 파기됩니다.</li>
      </ul>

      <label className="block sm:max-w-sm">
        <span className="mb-1.5 block text-base font-bold text-navy-900">
          확인을 위해 계정 이메일(<span className="font-medium">{email}</span>)을 적어 주세요
        </span>
        <input
          name="confirmEmail"
          type="email"
          autoComplete="off"
          required
          maxLength={254}
          className={input}
        />
      </label>

      <Result state={state} />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          onClick={(e) => {
            if (!confirm("정말 탈퇴할까요? 계정이 바로 지워지며 되돌릴 수 없습니다.")) e.preventDefault();
          }}
          className={dangerBtn}
        >
          {pending ? "탈퇴 처리 중…" : "회원 탈퇴"}
        </button>
      </div>
    </form>
  );
}

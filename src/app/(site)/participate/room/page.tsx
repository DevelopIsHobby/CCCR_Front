import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import ServiceIntro from "@/components/sub/ServiceIntro";
import RoomBookingDialog from "@/components/RoomBookingDialog";
import { getApplicant } from "@/lib/db/me";
import { ROOM_LABEL } from "@/lib/room-types";

export const metadata: Metadata = { title: "회의실 예약" };

export default async function Page() {
  const me = await getApplicant();

  return (
    <PageShell
      href="/participate/room"
      desc="조합 회의실을 빌려 쓰실 수 있습니다."
    >
      <ServiceIntro
        eyebrow="대회의실 · 소회의실"
        title="회의실 예약"
        desc="조합 사무국의 회의실을 회원사와 유관기관에 빌려드립니다. 원하시는 날짜와 시간을 고르시면 사무국에서 확인한 뒤 확정해 드립니다."
        points={[
          { title: ROOM_LABEL.large, desc: "세미나·간담회처럼 여러 명이 모이는 자리에 맞습니다." },
          { title: ROOM_LABEL.small, desc: "소규모 회의와 실무 협의에 씁니다." },
          { title: "확정 후 이용", desc: "신청만으로 잡히지 않습니다. 사무국이 확정해야 예약입니다." },
        ]}
        steps={[
          "회의실·날짜·시간을 골라 신청",
          "접수 확인 메일 받기",
          "사무국이 일정 확인 후 확정",
          "확정 안내를 받고 이용",
        ]}
        notes={[
          "이미 확정된 예약이나 조합이 직접 쓰는 시간과 겹치면 신청 단계에서 막힙니다.",
          "확정 전에는 다른 신청이 먼저 잡힐 수 있습니다.",
          "일정이 바뀌거나 취소가 필요하시면 이용일 전에 사무국으로 알려 주세요.",
          "이용 인원과 목적을 적어 주시면 자리를 준비하는 데 도움이 됩니다.",
        ]}
        action={<RoomBookingDialog me={me} />}
      />

      <p className="mt-11 rounded-xl border border-line bg-surface px-5 py-4 text-base leading-relaxed text-ink-600 lg:px-6">
        넣으신 신청이 어떻게 되고 있는지는{" "}
        <Link href="/participate/status" className="font-bold text-brand-600 hover:underline">
          신청 현황 조회
        </Link>
        에서 확인하실 수 있습니다.
      </p>
    </PageShell>
  );
}

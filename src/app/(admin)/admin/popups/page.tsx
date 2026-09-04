import type { Metadata } from "next";
import { Note, PageHead } from "@/components/admin/AdminUi";
import PopupEditor from "@/components/admin/PopupEditor";
import { listAllPopups, popupState } from "@/lib/db/popups";

export const metadata: Metadata = { title: "공지 팝업" };

export default async function Page() {
  const popups = await listAllPopups();

  return (
    <div className="space-y-6">
      <PageHead
        title="공지 팝업"
        desc="메인 화면에 들어오면 뜨는 안내창입니다. 그림 한 장을 올려 쓰고, 누르면 정해 둔 곳으로 보냅니다."
      />

      <Note>
        기간을 정해 두면 지난 뒤에 따로 끄지 않아도 사라집니다. 방문자가 &lsquo;오늘 하루 보지
        않기&rsquo;를 누르면 그 사람에게는 자정까지 뜨지 않습니다.
      </Note>

      <PopupEditor popups={popups.map((popup) => ({ popup, state: popupState(popup) }))} />
    </div>
  );
}

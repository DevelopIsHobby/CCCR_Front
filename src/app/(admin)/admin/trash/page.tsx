import type { Metadata } from "next";
import TrashList from "@/components/admin/TrashList";
import { listTrash } from "@/lib/db/trash";
import { TRASH_KEEP_DAYS } from "@/lib/trash-types";

export const metadata: Metadata = { title: "휴지통" };

export default async function Page() {
  const rows = await listTrash();

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-navy-900">휴지통</h1>
        <p className="mt-2 text-md text-ink-600">
          지운 것은 바로 없어지지 않고 여기에 {TRASH_KEEP_DAYS}일 동안 남습니다. 잘못 지웠다면
          되돌리시면 되고, {TRASH_KEEP_DAYS}일이 지나면 밤에 저절로 지워집니다.
        </p>
      </div>

      <TrashList rows={rows} />
    </>
  );
}

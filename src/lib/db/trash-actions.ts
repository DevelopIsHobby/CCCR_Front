"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { purge, restore } from "@/lib/db/trash";
import type { TrashKind } from "@/lib/trash-types";

/*
  휴지통에서 되돌리거나 비운다.

  되돌리면 원래 있던 목록으로 돌아간다. 순서(sort_order)와 상태는 그대로
  남아 있으므로 지우기 전 자리에 그대로 선다.
*/

const KINDS = new Set<TrashKind>([
  "post",
  "company",
  "notice",
  "proposal",
  "promo",
  "room",
  "aboutCard",
  "department",
  "history",
]);

function parse(formData: FormData): { kind: TrashKind; id: number } | null {
  const kind = String(formData.get("kind") ?? "") as TrashKind;
  const id = Number(formData.get("id"));
  if (!KINDS.has(kind) || !id) return null;
  return { kind, id };
}

/* 되돌린 것이 어디에 나타나는지 화면마다 다르므로 관련된 곳을 함께 새로 고친다. */
function refresh() {
  revalidatePath("/admin/trash");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/companies");
  revalidatePath("/admin/notices");
  revalidatePath("/admin/proposals");
  revalidatePath("/admin/promos");
  revalidatePath("/admin/rooms");
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
}

export async function restoreItem(formData: FormData): Promise<void> {
  await requireAdmin();

  const target = parse(formData);
  if (!target) return;

  await restore(target.kind, target.id);
  refresh();
}

export async function purgeItem(formData: FormData): Promise<void> {
  await requireAdmin();

  const target = parse(formData);
  if (!target) return;

  await purge(target.kind, target.id);
  refresh();
}

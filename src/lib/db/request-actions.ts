"use server";

import { redirect } from "next/navigation";
import { findRequestByRef } from "@/lib/db/requests";

/*
  접수번호로 신청 한 건을 찾는다.

  찾으면 그 신청의 조회 주소로 보낸다. 결과를 화면 상태로만 들고 있으면
  뒤로 갔다 오거나 새로고침할 때 사라지고, 돌아올 주소도 없다.
  주소가 생기면 즐겨찾기에 두거나 다시 열어 볼 수 있다.

  접수번호와 이메일은 폼으로 받는다. 주소창과 방문 기록에 이메일이 남지 않게 하려는 것이다.
  못 찾은 이유(번호가 틀렸는지 이메일이 틀렸는지)는 알려 주지 않는다.
  알려 주면 접수번호만 바꿔 가며 남의 신청이 있는지 떠볼 수 있다.
*/

export type LookupState = { error?: string };

export async function lookupRequest(
  _prev: LookupState,
  formData: FormData,
): Promise<LookupState> {
  const ref = String(formData.get("ref") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!ref) return { error: "접수번호를 입력해 주세요." };
  if (!email) return { error: "신청할 때 적으신 이메일을 입력해 주세요." };

  const found = await findRequestByRef(ref, email);
  if (!found) {
    return {
      error:
        "그런 신청을 찾지 못했습니다. 접수번호와 이메일을 다시 확인해 주세요. " +
        "접수 확인 메일에 두 가지가 모두 적혀 있습니다.",
    };
  }

  redirect(`/participate/status/${found.token}`);
}

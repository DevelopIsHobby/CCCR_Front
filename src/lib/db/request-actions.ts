"use server";

import { findRequestByRef, type RequestSummary } from "@/lib/db/requests";

/*
  접수번호로 신청 한 건을 찾는다.

  주소에 붙이지 않고 폼으로 받는다. 이메일이 주소창과 방문 기록에 남지 않게 하려는 것이다.
  찾지 못한 이유(번호가 틀렸는지 이메일이 틀렸는지)는 알려 주지 않는다.
  알려 주면 접수번호만 바꿔 가며 남의 신청이 있는지 떠볼 수 있다.
*/

export type LookupState = { error?: string; found?: RequestSummary };

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

  return { found };
}

import Link from "next/link";
import { IconArrow } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden bg-navy-900">
      <div className="hex-field absolute inset-0" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-brand-700/60"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-[60vh] max-w-[1280px] flex-col items-center justify-center px-6 py-24 text-center">
        <p className="label-mono text-flame-500">Error 404</p>
        <h1 className="mt-5 text-[1.9rem] font-bold leading-snug text-white lg:text-[2.5rem]">
          요청하신 페이지를 찾을 수 없습니다
        </h1>
        <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-brand-100/70">
          주소가 변경되었거나 삭제된 페이지일 수 있습니다. 입력하신 주소를 다시 확인해 주세요.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-flame-500 px-6 py-3.5 text-[0.9rem] font-bold text-white transition-colors hover:bg-flame-600"
          >
            홈으로 가기
            <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/board/notice"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3.5 text-[0.9rem] font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white/20"
          >
            공지사항
          </Link>
        </div>
      </div>
    </div>
  );
}

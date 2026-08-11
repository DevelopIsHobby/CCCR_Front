import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/sub/PageShell";
import { IconArrow } from "@/components/Icons";

export const metadata: Metadata = { title: "English" };

export default function Page() {
  return (
    <PageShell
      href="/en"
      title="English"
      category="Language"
      eng="English Page"
      desc="The English version of this website is under preparation."
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[1.35rem] font-bold leading-snug text-navy-900">
          Consortium of Cloud Computing Research
        </p>
        <p className="mt-5 leading-relaxed text-ink-600">
          C3R supports joint research and development, standardization, and workforce training so
          that the cloud computing industry can contribute to the fourth industrial revolution and
          the intelligent information society.
        </p>
        <p className="mt-8 rounded-lg bg-surface px-6 py-5 text-[0.9rem] leading-relaxed text-ink-600">
          Full English pages are being prepared. For inquiries, please contact{" "}
          <a href="mailto:info@c3r.or.kr" className="font-bold text-brand-600 hover:underline">
            info@c3r.or.kr
          </a>
          .
        </p>

        <Link
          href="/"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3.5 text-[0.9rem] font-bold text-white transition-colors hover:bg-brand-600"
        >
          Go to Korean site
          <IconArrow className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </PageShell>
  );
}

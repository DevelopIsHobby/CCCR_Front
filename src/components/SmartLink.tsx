import Link from "next/link";

/*
  내부 경로면 Next 링크로, 바깥 주소면 새 창으로 연다.
  교육 홈페이지처럼 별도로 운영하는 사이트를 가리키는 곳에서 쓴다.
*/
export const isExternal = (href: string) => /^https?:\/\//i.test(href);

export default function SmartLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}

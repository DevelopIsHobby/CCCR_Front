import Image from "next/image";
import logo from "@/assets/cccr-logo.png";
import logoWhite from "@/assets/cccr-logo-white.png";

type Props = { variant?: "dark" | "light"; className?: string };

/*
  C3R 공식 로고.

  글자로 흉내 내면 C³R 의 색·위첨자·곡선이 공식 로고와 어긋나므로 원본 그림을 그대로 쓴다.
  밝은 바탕(헤더)은 검은 글씨판, 어두운 바탕(푸터)은 흰 글씨판이다.
  원본의 바깥 여백은 잘라 두었다(두 판의 여백 비율이 달라 같은 높이로 두면 크기가 어긋났다).
  높이만 정하고 너비는 비율대로 따라가게 둔다.
*/
export default function Logo({ variant = "dark", className = "" }: Props) {
  return (
    <Image
      src={variant === "dark" ? logo : logoWhite}
      alt="한국클라우드컴퓨팅연구조합 Consortium of Cloud Computing Research"
      width={284}
      height={36}
      className={`h-7 w-auto sm:h-8 lg:h-9 ${className}`}
    />
  );
}

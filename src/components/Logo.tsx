import Image from "next/image";
import logo from "@/assets/cccr-logo.png";
import logoWhite from "@/assets/cccr-logo-white.png";

type Props = {
  variant?: "dark" | "light";
  /** 크기. 높이만 정하고 너비는 비율대로 따라가게 두는 것이 기본이다. */
  className?: string;
  /** 첫 화면 맨 위(헤더)에 있어 늦게 뜨면 빈자리가 보인다. 그런 곳만 바로 불러온다. */
  eager?: boolean;
};

/*
  C3R 공식 로고.

  글자로 흉내 내면 C³R 의 색·위첨자·곡선이 공식 로고와 어긋나므로 원본 그림을 그대로 쓴다.
  기본은 검은 글씨판이다. 흰 글씨판(light)은 C 가 남색이라 짙은 바탕에서 묻히므로,
  푸터는 흰 판 위에 기본 로고를 올려 쓴다.
  원본의 바깥 여백은 잘라 두었다(두 판의 여백 비율이 달라 같은 높이로 두면 크기가 어긋났다).
  높이만 정하고 너비는 비율대로 따라가게 둔다.
*/
export default function Logo({
  variant = "dark",
  className = "h-7 w-auto sm:h-8 lg:h-9",
  eager = false,
}: Props) {
  return (
    <Image
      src={variant === "dark" ? logo : logoWhite}
      alt="한국클라우드컴퓨팅연구조합 Consortium of Cloud Computing Research"
      width={284}
      height={36}
      className={className}
      loading={eager ? "eager" : undefined}
    />
  );
}

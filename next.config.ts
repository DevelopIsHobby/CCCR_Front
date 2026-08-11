import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 상위 폴더의 package-lock.json을 루트로 오인하지 않도록 고정
  turbopack: { root: __dirname },
  /* config options here */
};

export default nextConfig;

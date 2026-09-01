"use client";

import { useEffect, useRef, useState } from "react";

/*
  카카오 지도. 사무국이 발급한 JavaScript 키와 사무실 좌표가 모두 있을 때만 그린다.
  SDK 는 화면에 지도가 있을 때 한 번만 내려받고 그 다음부터는 같은 것을 쓴다.
*/
declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (cb: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (el: HTMLElement, options: { center: unknown; level: number }) => unknown;
        Marker: new (options: { map: unknown; position: unknown }) => unknown;
      };
    };
  }
}

const SCRIPT_ID = "kakao-maps-sdk";

function loadSdk(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("지도를 불러오지 못했습니다.")), {
      once: true,
    });

    if (!existing) {
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
        key,
      )}&autoload=false`;
      document.head.appendChild(script);
    }
  });
}

export default function KakaoMap({
  appKey,
  lat,
  lng,
  label,
}: {
  appKey: string;
  lat: number;
  lng: number;
  label: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadSdk(appKey)
      .then(() => {
        const kakao = window.kakao;
        if (cancelled || !kakao || !boxRef.current) return;

        kakao.maps.load(() => {
          if (cancelled || !boxRef.current) return;

          const center = new kakao.maps.LatLng(lat, lng);
          const map = new kakao.maps.Map(boxRef.current, { center, level: 3 });
          new kakao.maps.Marker({ map, position: center });
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [appKey, lat, lng]);

  if (failed) {
    return (
      <div className="grid aspect-[16/6] place-items-center bg-surface px-6 text-center">
        <p className="text-md text-ink-600">
          지도를 불러오지 못했습니다. 지도 키를 다시 확인해 주세요.
        </p>
      </div>
    );
  }

  return <div ref={boxRef} aria-label={`${label} 위치 지도`} className="aspect-[16/6] w-full" />;
}

"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

type KakaoLatLng = object;

type KakaoMapSdk = {
  maps: {
    load: (callback: () => void) => void;
    LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
    Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number; scrollwheel?: boolean }) => {
      setCenter: (position: KakaoLatLng) => void;
      addControl: (control: object, position: unknown) => void;
    };
    Marker: new (options: { map: object; position: KakaoLatLng; title?: string }) => object;
    MapTypeControl: new () => object;
    ZoomControl: new () => object;
    ControlPosition: { TOPRIGHT: unknown; RIGHT: unknown };
    services: {
      Geocoder: new () => {
        addressSearch: (
          address: string,
          callback: (result: Array<{ x: string; y: string }>, status: string) => void,
        ) => void;
      };
      Status: { OK: string };
    };
  };
};

type KakaoWindow = Window & { kakao?: KakaoMapSdk };

const STORE_ADDRESS = "서울특별시 종로구 대학로11길 23";
const FALLBACK_POSITION = { latitude: 37.5821092, longitude: 127.0003792 };

export function KakaoStoreMap() {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const retryTimerRef = useRef<number | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading");
  const javascriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
  const visibleState = javascriptKey ? mapState : "error";

  const initializeMap = useCallback((attempt = 0) => {
    if (initializedRef.current || !mapElementRef.current) return;

    const kakao = (window as KakaoWindow).kakao;
    if (!kakao?.maps) {
      if (attempt < 20) {
        retryTimerRef.current = window.setTimeout(() => initializeMap(attempt + 1), 100);
      } else {
        setMapState("error");
      }
      return;
    }

    kakao.maps.load(() => {
      if (initializedRef.current || !mapElementRef.current) return;
      initializedRef.current = true;

      const fallbackCenter = new kakao.maps.LatLng(FALLBACK_POSITION.latitude, FALLBACK_POSITION.longitude);
      const map = new kakao.maps.Map(mapElementRef.current, {
        center: fallbackCenter,
        level: 3,
        scrollwheel: false,
      });

      map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);
      map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

      const placeMarker = (position: KakaoLatLng) => {
        map.setCenter(position);
        new kakao.maps.Marker({ map, position, title: "DROP ROOM" });
        setMapState("ready");
      };

      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(STORE_ADDRESS, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result[0]) {
          placeMarker(new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x)));
          return;
        }

        placeMarker(fallbackCenter);
      });
    });
  }, []);

  useEffect(() => {
    if (!javascriptKey) return;
    initializeMap();

    return () => {
      if (retryTimerRef.current !== null) window.clearTimeout(retryTimerRef.current);
    };
  }, [initializeMap, javascriptKey]);

  return (
    <div className={`about-store-map is-${visibleState}`}>
      <div ref={mapElementRef} className="about-store-map-canvas" aria-label="DROP ROOM 매장 카카오 지도" />

      {visibleState !== "ready" && (
        <div className="about-store-map-status" role="status">
          <strong>{visibleState === "loading" ? "카카오 지도를 불러오는 중입니다." : "지도를 표시할 수 없습니다."}</strong>
          <span>
            {visibleState === "loading"
              ? "매장 위치를 확인하고 있어요."
              : "아래 카카오맵 링크에서 정확한 위치와 길찾기를 확인해 주세요."}
          </span>
        </div>
      )}

      {javascriptKey ? (
        <Script
          id="kakao-store-map-sdk"
          src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${javascriptKey}&autoload=false&libraries=services`}
          strategy="afterInteractive"
          onLoad={initializeMap}
          onReady={initializeMap}
          onError={() => setMapState("error")}
        />
      ) : (
        <span className="sr-only">카카오 지도 JavaScript 키가 설정되지 않았습니다.</span>
      )}
    </div>
  );
}

"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import Script from "next/script";
import type { RefObject } from "react";
import { useState } from "react";

type KakaoPostcodeData = {
  zonecode: string;
  userSelectedType: "R" | "J";
  roadAddress: string;
  jibunAddress: string;
  bname: string;
  buildingName: string;
  apartment: "Y" | "N";
};

type KakaoPostcodeInstance = {
  open: () => void;
};

declare global {
  interface Window {
    kakao?: {
      Postcode: new (options: {
        oncomplete: (data: KakaoPostcodeData) => void;
      }) => KakaoPostcodeInstance;
    };
  }
}

type KakaoAddressFieldsProps = {
  idPrefix: string;
  postcode: string;
  address: string;
  onPostcodeChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  detailInputRef?: RefObject<HTMLInputElement | null>;
};

const POSTCODE_SCRIPT_URL = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function formatSelectedAddress(data: KakaoPostcodeData) {
  const selectedAddress = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

  if (data.userSelectedType !== "R") return selectedAddress;

  const extras: string[] = [];
  if (data.bname && /[동로가]$/.test(data.bname)) extras.push(data.bname);
  if (data.buildingName && data.apartment === "Y") extras.push(data.buildingName);

  return extras.length > 0 ? `${selectedAddress} (${extras.join(", ")})` : selectedAddress;
}

export function KakaoAddressFields({
  idPrefix,
  postcode,
  address,
  onPostcodeChange,
  onAddressChange,
  detailInputRef,
}: KakaoAddressFieldsProps) {
  const [postcodeReady, setPostcodeReady] = useState(Boolean(globalThis.window?.kakao?.Postcode));
  const [postcodeError, setPostcodeError] = useState(false);
  const postcodeId = `${idPrefix}-postcode`;
  const addressId = `${idPrefix}-address`;

  const openPostcodeSearch = () => {
    if (!postcodeReady || !window.kakao?.Postcode) return;

    new window.kakao.Postcode({
      oncomplete: (data) => {
        onPostcodeChange(data.zonecode);
        onAddressChange(formatSelectedAddress(data));
        requestAnimationFrame(() => detailInputRef?.current?.focus());
      },
    }).open();
  };

  const markReady = () => {
    setPostcodeReady(Boolean(window.kakao?.Postcode));
    setPostcodeError(false);
  };

  return (
    <>
      <Script
        id="kakao-postcode-script"
        src={POSTCODE_SCRIPT_URL}
        strategy="afterInteractive"
        onLoad={markReady}
        onReady={markReady}
        onError={() => {
          setPostcodeReady(false);
          setPostcodeError(true);
        }}
      />

      <div className="address-postcode-field">
        <label htmlFor={postcodeId}><span>우편번호</span></label>
        <div className="address-search-row">
          <input
            id={postcodeId}
            name="postcode"
            required
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="우편번호"
            value={postcode}
            readOnly={!postcodeError}
            onChange={(event) => onPostcodeChange(event.target.value)}
          />
          <button type="button" onClick={openPostcodeSearch} disabled={!postcodeReady}>
            <MagnifyingGlass size={19} weight="bold" />
            우편번호 검색
          </button>
        </div>
        <small className={postcodeError ? "address-search-status error" : "address-search-status"}>
          {postcodeError
            ? "주소 검색을 불러오지 못했습니다. 우편번호와 주소를 직접 입력해 주세요."
            : postcodeReady
              ? "도로명, 건물명 또는 지번으로 검색할 수 있어요."
              : "카카오 주소 검색을 불러오는 중입니다."}
        </small>
      </div>

      <label className="full" htmlFor={addressId}>
        <span>기본 주소</span>
        <input
          id={addressId}
          name="address"
          required
          autoComplete="address-line1"
          placeholder="우편번호 검색으로 주소를 선택해 주세요"
          value={address}
          readOnly={!postcodeError}
          onChange={(event) => onAddressChange(event.target.value)}
          onClick={postcodeReady && !address ? openPostcodeSearch : undefined}
        />
      </label>
    </>
  );
}

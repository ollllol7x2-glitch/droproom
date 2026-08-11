"use client";

import { WarningCircle } from "@phosphor-icons/react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="shell complete-page"><WarningCircle size={56} /><p>ERROR</p><h1>화면을 불러오지 못했습니다.</h1><span>잠시 후 다시 시도해 주세요.</span><button className="primary-button" type="button" onClick={reset}>다시 시도</button></div>;
}

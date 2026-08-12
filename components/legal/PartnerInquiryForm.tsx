"use client";

import { CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";

export function PartnerInquiryForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <form className="partner-form" onSubmit={handleSubmit}>
      <div className="partner-form-heading">
        <h2>브랜드를 소개해 주세요</h2>
        <p>필수 정보만 먼저 확인합니다. 제출한 내용은 실제로 저장되거나 전송되지 않습니다.</p>
      </div>

      <div className="partner-form-grid">
        <label>
          <span>브랜드명</span>
          <input name="brand" type="text" placeholder="예: PAPERWEIGHT" required />
        </label>
        <label>
          <span>담당자명</span>
          <input name="manager" type="text" placeholder="예: 김드롭" required />
        </label>
        <label>
          <span>이메일</span>
          <input name="email" type="email" placeholder="hello@brand.com" required />
        </label>
        <label>
          <span>연락처</span>
          <input name="phone" type="tel" placeholder="010-1234-5678" required />
        </label>
        <label>
          <span>주요 카테고리</span>
          <select name="category" defaultValue="" required>
            <option value="" disabled>카테고리 선택</option>
            <option value="stationery">문구</option>
            <option value="digital">디지털</option>
            <option value="room">룸</option>
            <option value="fashion">패션</option>
            <option value="living">리빙</option>
            <option value="hobby">취미</option>
          </select>
        </label>
        <label>
          <span>브랜드 채널</span>
          <input name="channel" type="url" placeholder="https://brand.example" />
        </label>
        <label className="partner-form-wide">
          <span>상품과 브랜드 소개</span>
          <textarea name="message" rows={6} placeholder="대표 상품, 가격대, 입점 희망 시기를 간단히 적어주세요." required />
        </label>
      </div>

      <label className="partner-consent">
        <input name="consent" type="checkbox" required />
        <span>입점 검토를 위한 개인정보 수집 및 이용에 동의합니다. 데모 폼이므로 실제 정보는 입력하지 마세요.</span>
      </label>

      <button className="partner-submit" type="submit">
        문의 접수하기 <PaperPlaneTilt size={20} weight="bold" />
      </button>

      {submitted && (
        <div className="partner-success" role="status">
          <CheckCircle size={24} weight="fill" aria-hidden="true" />
          <div><strong>데모 문의가 접수되었습니다.</strong><span>실제 데이터는 저장되지 않았습니다.</span></div>
        </div>
      )}
    </form>
  );
}


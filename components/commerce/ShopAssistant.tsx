"use client";

import { ChatCircleDots, PaperPlaneTilt, Sparkle, X } from "@phosphor-icons/react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { assetPath } from "@/lib/assets";

type Provider = "groq" | "gemini" | "openai";
type Message = { role: "assistant" | "user"; content: string };

const providerOptions: { id: Provider; label: string }[] = [
  { id: "groq", label: "Groq" },
  { id: "gemini", label: "Gemini" },
  { id: "openai", label: "ChatGPT" },
];

const quickQuestions = ["1만원대 선물 추천해줘", "내 방에 둘 조명 골라줘", "신상품 중 인기 있는 건 뭐야?"];

const initialMessage: Message = {
  role: "assistant",
  content: "안녕하세요. 예산, 받는 사람, 원하는 카테고리를 알려주시면 DROP ROOM 상품을 골라드릴게요.",
};

export function ShopAssistant() {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<Provider>("groq");
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const send = async (event?: FormEvent<HTMLFormElement>, question?: string) => {
    event?.preventDefault();
    const content = (question ?? draft).trim();
    if (!content || pending) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setDraft("");
    setError("");

    if (isStaticExport) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "AI 상담은 API 키를 안전하게 보호하는 서버에서 제공됩니다. 현재 GitHub Pages 미리보기에서는 연결할 수 없습니다.",
        },
      ]);
      return;
    }

    setPending(true);
    try {
      const response = await fetch(assetPath("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, messages: nextMessages }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || typeof data?.reply !== "string") {
        throw new Error(typeof data?.error === "string" ? data.error : "AI 상담 연결에 실패했습니다.");
      }
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "AI 상담 연결에 실패했습니다.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section className={`shop-assistant ${open ? "is-open" : ""}`} aria-label="AI 쇼핑 도우미">
      {open && (
        <div className="shop-assistant-panel" role="dialog" aria-label="AI 쇼핑 도우미" aria-modal="false">
          <header className="shop-assistant-head">
            <div>
              <span className="shop-assistant-kicker"><Sparkle size={14} weight="fill" /> AI SHOPPING GUIDE</span>
              <h2>무엇을 찾고 있나요?</h2>
            </div>
            <button type="button" className="shop-assistant-close" aria-label="AI 쇼핑 도우미 닫기" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </header>

          <div className="shop-assistant-providers" aria-label="AI 모델 선택">
            {providerOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={provider === option.id}
                className={provider === option.id ? "active" : ""}
                onClick={() => setProvider(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="shop-assistant-messages" aria-live="polite">
            {messages.map((message, index) => (
              <p className={`shop-assistant-message ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </p>
            ))}
            {pending && <p className="shop-assistant-message assistant loading">상품을 살펴보고 있어요.</p>}
          </div>

          {messages.length === 1 && (
            <div className="shop-assistant-quick">
              {quickQuestions.map((question) => (
                <button key={question} type="button" onClick={() => void send(undefined, question)}>
                  {question}
                </button>
              ))}
            </div>
          )}

          {error && <p className="shop-assistant-error" role="alert">{error}</p>}

          <form className="shop-assistant-form" onSubmit={(event) => void send(event)}>
            <label className="sr-only" htmlFor="shop-assistant-input">쇼핑 질문</label>
            <input
              ref={inputRef}
              id="shop-assistant-input"
              value={draft}
              maxLength={700}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="예: 친구 선물 2만원대 추천해줘"
              disabled={pending}
            />
            <button type="submit" aria-label="질문 보내기" disabled={pending || !draft.trim()}>
              <PaperPlaneTilt size={19} weight="fill" />
            </button>
          </form>
          <p className="shop-assistant-notice">주문 변경과 개인정보 확인은 고객센터를 이용해 주세요.</p>
        </div>
      )}

      <button
        className="shop-assistant-trigger"
        type="button"
        aria-label={open ? "AI 쇼핑 도우미 닫기" : "AI 쇼핑 도우미 열기"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={23} /> : <ChatCircleDots size={25} weight="fill" />}
        <span>AI 추천</span>
      </button>
    </section>
  );
}

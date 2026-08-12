"use client";

import { ArrowRight, ChatCircleDots, PaperPlaneTilt, Sparkle, X } from "@phosphor-icons/react";
import { FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { products } from "@/data/products";
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

const productPathPattern = /\/(?:droproom\/)?product\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?/gi;

function renderMessageContent(content: string) {
  const normalizedContent = content.toLowerCase();
  const pathSlugs = new Set(
    [...content.matchAll(productPathPattern)].map((match) => match[1].toLowerCase()),
  );
  const referencedProducts = products
    .filter((product) =>
      pathSlugs.has(product.slug) ||
      normalizedContent.includes(product.slug.toLowerCase()) ||
      content.includes(product.name),
    )
    .slice(0, 4);

  if (referencedProducts.length === 0) return content;

  let cleanContent = content.replace(productPathPattern, "");
  referencedProducts.forEach((product) => {
    cleanContent = cleanContent.replace(
      new RegExp(`\\s*\\|?\\s*${product.slug.replaceAll("-", "\\-")}(?=\\s|$)`, "gi"),
      "",
    );
  });
  cleanContent = cleanContent.replace(/\n{3,}/g, "\n\n").trim();

  const parts: ReactNode[] = [<span key="message-copy">{cleanContent}</span>];
  parts.push(
    <span className="shop-assistant-product-links" key="product-links">
      {referencedProducts.map((product) => (
        <a
          className="shop-assistant-product-link"
          href={assetPath(`/product/${product.slug}`)}
          key={product.slug}
        >
          {product.name} 보기 <ArrowRight size={15} weight="bold" />
        </a>
      ))}
    </span>,
  );
  return parts;
}

export function ShopAssistant() {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<Provider>("groq");
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const latestQuestionRef = useRef<HTMLParagraphElement>(null);
  const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const latestQuestionIndex = messages.findLastIndex((message) => message.role === "user");

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

  useEffect(() => {
    if (!open || messages.length === 1) return;

    const frame = window.requestAnimationFrame(() => {
      const messageList = messagesRef.current;
      const latestQuestion = latestQuestionRef.current;
      if (!messageList || !latestQuestion) return;

      const listTop = messageList.getBoundingClientRect().top;
      const questionTop = latestQuestion.getBoundingClientRect().top;
      messageList.scrollTo({
        top: Math.max(0, messageList.scrollTop + questionTop - listTop - 8),
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [messages, open]);

  const send = async (event?: FormEvent<HTMLFormElement>, question?: string) => {
    event?.preventDefault();
    const content = (question ?? draft).trim();
    if (!content || pending) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setDraft("");
    setError("");

    setPending(true);
    try {
      if (isStaticExport && (!supabaseUrl || !supabasePublishableKey)) {
        throw new Error("AI 상담 서버 설정을 확인해 주세요.");
      }

      const endpoint = isStaticExport
        ? `${supabaseUrl}/functions/v1/shop-assistant`
        : assetPath("/api/chat");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isStaticExport
            ? {
                apikey: supabasePublishableKey!,
                Authorization: `Bearer ${supabasePublishableKey}`,
              }
            : {}),
        },
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

          <div ref={messagesRef} className="shop-assistant-messages" aria-live="polite">
            {messages.map((message, index) => (
              <p
                ref={index === latestQuestionIndex ? latestQuestionRef : undefined}
                className={`shop-assistant-message ${message.role}`}
                key={`${message.role}-${index}`}
              >
                {renderMessageContent(message.content)}
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

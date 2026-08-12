"use client";

import { Check, ChatCircleDots, CheckCircle, LockKey, Package, Palette, PencilSimple, Trash, X } from "@phosphor-icons/react";
import type { User } from "@supabase/supabase-js";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

type ProductQuestion = {
  id: string;
  userId: string;
  author: string;
  title: string;
  content: string;
  isPrivate: boolean;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
  updatedAt?: string;
  local?: boolean;
  demo?: boolean;
};

type QuestionRow = {
  id: string;
  user_id: string;
  author: string;
  title: string;
  content: string;
  is_private: boolean;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
};

type QuestionDraft = { author: string; title: string; content: string; isPrivate: boolean };

const emptyDraft: QuestionDraft = { author: "", title: "", content: "", isPrivate: false };

function demoQuestions(productSlug: string, productName: string): ProductQuestion[] {
  return [
    {
      id: `demo-${productSlug}-color`, userId: "demo", author: "소연", title: "실물 색상과 질감이 궁금해요",
      content: `${productName}은 상세 이미지와 비교했을 때 실제 색상이나 표면 질감에 차이가 큰가요?`, isPrivate: false,
      answer: "촬영 조명과 화면 설정에 따라 밝기는 조금 다르게 보일 수 있지만, 실제 색감에 가깝게 촬영했습니다. 자연광에서 보면 상세 이미지보다 질감이 조금 더 선명하게 느껴질 수 있어요.",
      answeredAt: "2026-08-10T13:40:00+09:00", createdAt: "2026-08-10T10:18:00+09:00", demo: true,
    },
    {
      id: `demo-${productSlug}-gift`, userId: "demo", author: "민지", title: "선물 포장도 같이 신청할 수 있나요?",
      content: "친구 생일 선물로 주문하려고 해요. 가격표를 제외하고 포장해서 받을 수 있을까요?", isPrivate: false,
      answer: "가능합니다. 주문서의 배송 메모에 ‘선물 포장 요청’과 ‘가격표 제거’를 남겨주세요. 상품 크기에 맞는 포장으로 준비해 드립니다.",
      answeredAt: "2026-08-09T16:05:00+09:00", createdAt: "2026-08-09T14:22:00+09:00", demo: true,
    },
    {
      id: `demo-${productSlug}-option`, userId: "demo", author: "하윤", title: "옵션별로 여러 개를 한 번에 주문할 수 있나요?",
      content: "서로 다른 옵션을 하나씩 담고 싶은데 옵션마다 수량을 따로 선택할 수 있는지 궁금합니다.", isPrivate: false,
      answer: "상품 상단에서 옵션과 수량을 선택한 뒤 ‘선택 추가’를 눌러 주세요. 다른 옵션도 같은 방식으로 추가하면 옵션별 수량을 확인하고 한 번에 장바구니에 담을 수 있습니다.",
      answeredAt: "2026-08-08T11:32:00+09:00", createdAt: "2026-08-08T09:47:00+09:00", demo: true,
    },
    {
      id: `demo-${productSlug}-delivery`, userId: "demo", author: "준호", title: "오늘 주문하면 언제 출고되나요?",
      content: "주말 전에 받아야 해서요. 평일 오후에 주문해도 당일 출고가 가능한가요?", isPrivate: false,
      answer: "평일 오후 2시 이전 결제 완료 주문은 재고 확인 후 당일 또는 다음 영업일에 출고됩니다. 정확한 도착일은 택배사 사정과 지역에 따라 달라질 수 있어요.",
      answeredAt: "2026-08-07T15:10:00+09:00", createdAt: "2026-08-07T13:26:00+09:00", demo: true,
    },
    {
      id: `demo-${productSlug}-restock`, userId: "demo", author: "지우", title: "품절 옵션 재입고 일정이 있나요?",
      content: "원하는 옵션이 품절로 보여요. 이번 달 안에 다시 입고될 예정인지 알고 싶습니다.", isPrivate: false,
      createdAt: "2026-08-11T18:35:00+09:00", demo: true,
    },
  ];
}

function userDisplayName(user: User | null) {
  if (!user) return "";
  return String(user.user_metadata.full_name || user.user_metadata.name || user.email?.split("@")[0] || "DROP ROOM 회원").slice(0, 20);
}

function mapRow(row: QuestionRow): ProductQuestion {
  return {
    id: row.id,
    userId: row.user_id,
    author: row.author,
    title: row.title,
    content: row.content,
    isPrivate: row.is_private,
    answer: row.answer || undefined,
    answeredAt: row.answered_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at !== row.created_at ? row.updated_at : undefined,
  };
}

function localKey(productSlug: string) {
  return `drop-room-questions:${productSlug}`;
}

function readLocalQuestions(productSlug: string): ProductQuestion[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(localKey(productSlug)) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ProductQuestion => Boolean(
      item && typeof item === "object" && typeof item.id === "string"
      && typeof item.author === "string" && typeof item.title === "string"
      && typeof item.content === "string" && typeof item.createdAt === "string",
    )).map((question) => ({ ...question, userId: question.userId || "local", local: true }));
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

export function ProductQuestions({ productSlug, productName }: { productSlug: string; productName: string }) {
  const { user, loading: authLoading, configured, signInWithGoogle } = useSupabaseUser();
  const [questions, setQuestions] = useState<ProductQuestion[]>([]);
  const [draft, setDraft] = useState<QuestionDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<QuestionDraft>(emptyDraft);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const questionButtonRef = useRef<HTMLButtonElement>(null);
  const questionDialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !draft.author) setDraft((current) => ({ ...current, author: userDisplayName(user) }));
  }, [draft.author, user]);

  const loadQuestions = useCallback(async () => {
    setReady(false);
    setError("");
    if (!isSupabaseConfigured) {
      setQuestions([...readLocalQuestions(productSlug), ...demoQuestions(productSlug, productName)]);
      setOfflineMode(true);
      setReady(true);
      return;
    }

    const { data, error: loadError } = await getSupabaseBrowserClient()
      .from("product_questions")
      .select("id,user_id,author,title,content,is_private,answer,answered_at,created_at,updated_at")
      .eq("product_slug", productSlug)
      .order("created_at", { ascending: false });

    if (loadError) {
      setQuestions([...readLocalQuestions(productSlug), ...demoQuestions(productSlug, productName)]);
      setOfflineMode(true);
    } else {
      setQuestions([...(data as QuestionRow[]).map(mapRow), ...demoQuestions(productSlug, productName)]);
      setOfflineMode(false);
    }
    setReady(true);
  }, [productName, productSlug]);

  useEffect(() => { void loadQuestions(); }, [loadQuestions]);

  useEffect(() => {
    if (!ready || !offlineMode) return;
    window.localStorage.setItem(localKey(productSlug), JSON.stringify(questions.filter((question) => !question.demo)));
  }, [offlineMode, productSlug, questions, ready]);

  useEffect(() => {
    if (window.location.hash === "#question-form") setQuestionFormOpen(true);
  }, []);

  useEffect(() => {
    if (!questionFormOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => questionDialogRef.current?.querySelector<HTMLElement>("[data-question-initial-focus]")?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) {
        setQuestionFormOpen(false);
        window.setTimeout(() => questionButtonRef.current?.focus(), 0);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = questionDialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [questionFormOpen, saving]);

  const validate = (value: QuestionDraft) => !value.author.trim()
    ? "작성자 이름을 입력해 주세요."
    : value.title.trim().length < 2
      ? "질문 제목을 2자 이상 입력해 주세요."
      : value.content.trim().length < 5
        ? "질문 내용을 5자 이상 입력해 주세요."
        : "";
  const canManage = (question: ProductQuestion) => !question.demo && (question.local || Boolean(user && question.userId === user.id));

  const requestLogin = () => void signInWithGoogle(`/product/${productSlug}/#question-form`);
  const openQuestionForm = () => { setError(""); setMessage(""); setQuestionFormOpen(true); };
  const closeQuestionForm = () => {
    if (saving) return;
    setQuestionFormOpen(false);
    window.setTimeout(() => questionButtonRef.current?.focus(), 0);
  };

  const addQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user && !offlineMode) { setError("질문을 등록하려면 Google 로그인이 필요합니다."); return; }
    const validationError = validate(draft);
    if (validationError) { setError(validationError); setMessage(""); return; }
    setSaving(true);

    if (offlineMode) {
      const now = new Date().toISOString();
      setQuestions((current) => [{
        id: crypto.randomUUID(), userId: "local", author: draft.author.trim(), title: draft.title.trim(),
        content: draft.content.trim(), isPrivate: draft.isPrivate, createdAt: now, local: true,
      }, ...current]);
    } else {
      const { data, error: saveError } = await getSupabaseBrowserClient().from("product_questions").insert({
        product_slug: productSlug,
        user_id: user!.id,
        author: draft.author.trim(),
        title: draft.title.trim(),
        content: draft.content.trim(),
        is_private: draft.isPrivate,
      }).select("id,user_id,author,title,content,is_private,answer,answered_at,created_at,updated_at").single();
      if (saveError) { setError("질문을 등록하지 못했습니다. 다시 시도해 주세요."); setSaving(false); return; }
      setQuestions((current) => [mapRow(data as QuestionRow), ...current]);
    }

    setDraft({ ...emptyDraft, author: userDisplayName(user) });
    setError(""); setMessage("질문이 등록되었습니다."); setSaving(false); setQuestionFormOpen(false);
    window.setTimeout(() => questionButtonRef.current?.focus(), 0);
  };

  const startEditing = (question: ProductQuestion) => {
    setEditingId(question.id);
    setEditingDraft({ author: question.author, title: question.title, content: question.content, isPrivate: question.isPrivate });
    setDeletingId(null); setMessage(""); setError("");
  };

  const updateQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;
    const validationError = validate(editingDraft);
    if (validationError) { setError(validationError); return; }
    const target = questions.find((question) => question.id === editingId);
    if (!target || !canManage(target)) return;
    setSaving(true);
    const updatedAt = new Date().toISOString();

    if (!offlineMode) {
      const { error: updateError } = await getSupabaseBrowserClient().from("product_questions").update({
        author: editingDraft.author.trim(), title: editingDraft.title.trim(), content: editingDraft.content.trim(),
        is_private: editingDraft.isPrivate, updated_at: updatedAt,
      }).eq("id", editingId).eq("user_id", user!.id);
      if (updateError) { setError("질문을 수정하지 못했습니다."); setSaving(false); return; }
    }

    setQuestions((current) => current.map((question) => question.id === editingId ? {
      ...question, author: editingDraft.author.trim(), title: editingDraft.title.trim(),
      content: editingDraft.content.trim(), isPrivate: editingDraft.isPrivate, updatedAt,
    } : question));
    setEditingId(null); setError(""); setMessage("질문이 수정되었습니다."); setSaving(false);
  };

  const deleteQuestion = async (question: ProductQuestion) => {
    if (!canManage(question)) return;
    setSaving(true);
    if (!offlineMode) {
      const { error: deleteError } = await getSupabaseBrowserClient().from("product_questions").delete().eq("id", question.id).eq("user_id", user!.id);
      if (deleteError) { setError("질문을 삭제하지 못했습니다."); setSaving(false); return; }
    }
    setQuestions((current) => current.filter((item) => item.id !== question.id));
    setDeletingId(null); setError(""); setMessage("질문이 삭제되었습니다."); setSaving(false);
  };

  return <section className="shell product-questions" id="product-questions" aria-labelledby="product-questions-title">
    <div className="product-questions-heading">
      <div><h2 id="product-questions-title">상품 Q&amp;A</h2><p>{productName}에 대해 궁금한 점을 남겨주세요.</p></div>
      <button ref={questionButtonRef} type="button" onClick={openQuestionForm}>질문 쓰기</button>
    </div>
    <div className="product-questions-layout">
      <aside className="question-summary" aria-label="구매 전 확인 안내">
        <span>BEFORE YOU ASK</span>
        <h3>구매 전,<br />이것부터 확인해 보세요.</h3>
        <ul>
          <li><Palette size={21} weight="duotone" /><div><strong>옵션과 색상</strong><p>현재 선택 가능한 옵션은 상품 상단에서 바로 확인할 수 있어요.</p></div></li>
          <li><Package size={21} weight="duotone" /><div><strong>배송과 교환</strong><p>평일 오후 2시 이전 주문은 다음 영업일부터 순차 발송됩니다.</p></div></li>
          <li><LockKey size={21} weight="duotone" /><div><strong>개인적인 문의</strong><p>주문 정보가 포함된다면 비공개 질문으로 안전하게 남겨주세요.</p></div></li>
        </ul>
        <button type="button" onClick={openQuestionForm}><ChatCircleDots size={19} weight="bold" /> 해결되지 않았다면 질문하기</button>
      </aside>
      <div className="question-content">
        <div className="question-list-heading"><h3>질문 목록</h3><span>{questions.length}</span></div>
        <div className="question-feedback" aria-live="polite">{message && <p>{message}</p>}</div>
        <div className="question-list" aria-busy={!ready}>
          {!ready && <div className="question-empty"><p>질문을 불러오고 있습니다.</p></div>}
          {ready && !questions.length && <div className="question-empty"><ChatCircleDots size={34} /><h3>아직 등록된 질문이 없어요.</h3><p>옵션, 배송, 사용 방법처럼 궁금한 점을 먼저 물어보세요.</p></div>}
          {ready && questions.map((question) => <article className="question-item" key={question.id}>{editingId === question.id ? <form className="question-edit-form" onSubmit={updateQuestion}>
            <label><span>작성자</span><input value={editingDraft.author} maxLength={20} onChange={(event) => setEditingDraft((current) => ({ ...current, author: event.target.value }))} /></label>
            <label><span>질문 제목</span><input value={editingDraft.title} maxLength={80} onChange={(event) => setEditingDraft((current) => ({ ...current, title: event.target.value }))} /></label>
            <label><span>질문 내용</span><textarea value={editingDraft.content} rows={4} maxLength={1000} onChange={(event) => setEditingDraft((current) => ({ ...current, content: event.target.value }))} /></label>
            <label className="question-private-toggle"><input type="checkbox" checked={editingDraft.isPrivate} onChange={(event) => setEditingDraft((current) => ({ ...current, isPrivate: event.target.checked }))} /><span><LockKey size={18} /> 비공개 질문</span></label>
            <div><button type="submit" disabled={saving}><Check size={18} weight="bold" /> 수정 완료</button><button type="button" onClick={() => setEditingId(null)}><X size={18} /> 취소</button></div>
          </form> : <>
            <header><div className="question-status-row"><span className={question.answer ? "answered" : "waiting"}>{question.answer ? <CheckCircle size={17} weight="fill" /> : <ChatCircleDots size={17} />} {question.answer ? "답변 완료" : "답변 대기"}</span>{question.isPrivate && <span className="private"><LockKey size={16} /> 비공개</span>}</div><div className="question-meta"><strong>{question.author}</strong><span>{formatDate(question.createdAt)}{question.updatedAt ? " 수정됨" : ""}</span></div></header>
            <h4>{question.title}</h4><p className="question-body">{question.content}</p>
            {question.answer && <div className="question-answer"><span>A</span><div><strong>DROP ROOM 답변</strong><p>{question.answer}</p>{question.answeredAt && <small>{formatDate(question.answeredAt)}</small>}</div></div>}
            {canManage(question) && (deletingId === question.id ? <div className="question-delete-confirm" role="alert"><span>이 질문을 삭제할까요?</span><button type="button" disabled={saving} onClick={() => void deleteQuestion(question)}>삭제</button><button type="button" onClick={() => setDeletingId(null)}>취소</button></div> : <div className="question-item-actions"><button type="button" onClick={() => startEditing(question)}><PencilSimple size={17} /> 수정</button><button type="button" onClick={() => setDeletingId(question.id)}><Trash size={17} /> 삭제</button></div>)}
          </>}</article>)}
        </div>
      </div>
    </div>

    {questionFormOpen && <div className="review-write-overlay question-write-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeQuestionForm(); }}>
      <div ref={questionDialogRef} className="review-write-dialog question-write-dialog" role="dialog" aria-modal="true" aria-labelledby="question-write-title" aria-describedby="question-write-description">
        <header className="review-write-dialog-head">
          <div><span>PRODUCT Q&amp;A</span><h3 id="question-write-title">질문 쓰기</h3><p id="question-write-description">{productName}에 관해 확인하고 싶은 내용을 남겨주세요.</p></div>
          <button type="button" aria-label="질문 작성 닫기" disabled={saving} onClick={closeQuestionForm}><X size={24} /></button>
        </header>
        {configured && !authLoading && !user && !offlineMode ? <div className="review-login-prompt" id="question-form"><div><h3>로그인하고 질문을 남겨보세요.</h3><p>Google 계정으로 작성하면 답변과 질문을 안전하게 관리할 수 있습니다.</p></div><button data-question-initial-focus type="button" onClick={requestLogin}>Google 로그인</button></div> : <form className="question-form" id="question-form" onSubmit={addQuestion}>
          <p className="question-form-notice">{offlineMode ? "현재 질문은 이 브라우저에 저장됩니다." : "비공개를 선택하지 않으면 질문이 모든 사용자에게 공개됩니다."}</p>
          <div className="question-form-fields"><label><span>작성자</span><input data-question-initial-focus value={draft.author} maxLength={20} autoComplete="name" onChange={(event) => setDraft((current) => ({ ...current, author: event.target.value }))} /></label><label><span>질문 제목</span><input value={draft.title} maxLength={80} placeholder="예: 라임 색상은 실제로 형광에 가까운가요?" onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label><label><span>질문 내용</span><textarea value={draft.content} rows={6} maxLength={1000} placeholder="배송, 옵션, 소재, 사용 방법 등을 구체적으로 적어주세요." onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} /><small>{draft.content.length}/1000</small></label></div>
          <label className="question-private-toggle"><input type="checkbox" checked={draft.isPrivate} onChange={(event) => setDraft((current) => ({ ...current, isPrivate: event.target.checked }))} /><span><LockKey size={18} /> 비공개 질문으로 등록</span></label>
          {error && <p className="review-modal-error" role="alert">{error}</p>}<button className="review-submit-button question-submit-button" type="submit" disabled={saving}><Check size={19} weight="bold" /> {saving ? "등록 중" : "질문 등록"}</button>
        </form>}
      </div>
    </div>}
  </section>;
}

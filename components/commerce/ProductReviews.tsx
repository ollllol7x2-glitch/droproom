"use client";

import { Check, PencilSimple, Star, Trash, X } from "@phosphor-icons/react";
import type { User } from "@supabase/supabase-js";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useSupabaseUser } from "@/components/auth/useSupabaseUser";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

type ProductReview = {
  id: string;
  userId: string;
  author: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  local?: boolean;
};

type ReviewRow = {
  id: string;
  user_id: string;
  author: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at: string;
};

type ReviewDraft = { author: string; rating: number; content: string };

function userDisplayName(user: User | null) {
  if (!user) return "";
  return String(user.user_metadata.full_name || user.user_metadata.name || user.email?.split("@")[0] || "DROP ROOM 회원").slice(0, 20);
}

function mapRow(row: ReviewRow): ProductReview {
  return {
    id: row.id,
    userId: row.user_id,
    author: row.author,
    rating: row.rating,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at !== row.created_at ? row.updated_at : undefined,
  };
}

function localKey(productSlug: string) {
  return `drop-room-reviews:${productSlug}`;
}

function readLocalReviews(productSlug: string): ProductReview[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(localKey(productSlug)) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ProductReview => Boolean(
      item && typeof item === "object" && typeof item.id === "string"
      && typeof item.author === "string" && typeof item.content === "string"
      && typeof item.rating === "number" && typeof item.createdAt === "string",
    )).map((review) => ({ ...review, userId: review.userId || "local", local: true }));
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function StarSelector({ value, onChange, label }: { value: number; onChange: (rating: number) => void; label: string }) {
  return <div className="review-star-selector" role="radiogroup" aria-label={label}>
    {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" role="radio" aria-checked={value === rating} aria-label={`${rating}점`} className={rating <= value ? "active" : ""} onClick={() => onChange(rating)}><Star size={25} weight={rating <= value ? "fill" : "regular"} /></button>)}
    <strong>{value}.0</strong>
  </div>;
}

export function ProductReviews({ productSlug, productName }: { productSlug: string; productName: string }) {
  const { user, loading: authLoading, configured, signInWithGoogle } = useSupabaseUser();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [draft, setDraft] = useState<ReviewDraft>({ author: "", rating: 5, content: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<ReviewDraft>({ author: "", rating: 5, content: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !draft.author) setDraft((current) => ({ ...current, author: userDisplayName(user) }));
  }, [draft.author, user]);

  const loadReviews = useCallback(async () => {
    setReady(false);
    setError("");
    if (!isSupabaseConfigured) {
      setReviews(readLocalReviews(productSlug));
      setOfflineMode(true);
      setReady(true);
      return;
    }

    const { data, error: loadError } = await getSupabaseBrowserClient()
      .from("product_reviews")
      .select("id,user_id,author,rating,content,created_at,updated_at")
      .eq("product_slug", productSlug)
      .order("created_at", { ascending: false });

    if (loadError) {
      setReviews(readLocalReviews(productSlug));
      setOfflineMode(true);
      setError("공용 리뷰를 불러오지 못해 이 브라우저에 저장된 리뷰를 표시합니다.");
    } else {
      setReviews((data as ReviewRow[]).map(mapRow));
      setOfflineMode(false);
    }
    setReady(true);
  }, [productSlug]);

  useEffect(() => { void loadReviews(); }, [loadReviews]);

  useEffect(() => {
    if (!ready || !offlineMode) return;
    window.localStorage.setItem(localKey(productSlug), JSON.stringify(reviews));
  }, [offlineMode, productSlug, ready, reviews]);

  const average = useMemo(() => reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0, [reviews]);
  const distribution = useMemo(() => [5, 4, 3, 2, 1].map((rating) => ({ rating, count: reviews.filter((review) => review.rating === rating).length })), [reviews]);
  const validate = (value: ReviewDraft) => !value.author.trim() ? "작성자 이름을 입력해 주세요." : value.content.trim().length < 5 ? "리뷰를 5자 이상 입력해 주세요." : "";
  const canManage = (review: ProductReview) => review.local || Boolean(user && review.userId === user.id);

  const requestLogin = () => void signInWithGoogle(`/product/${productSlug}/#review-form`);

  const addReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user && !offlineMode) { setError("리뷰를 등록하려면 Google 로그인이 필요합니다."); return; }
    const validationError = validate(draft);
    if (validationError) { setError(validationError); setMessage(""); return; }
    setSaving(true);

    if (offlineMode) {
      const now = new Date().toISOString();
      setReviews((current) => [{ id: crypto.randomUUID(), userId: "local", author: draft.author.trim(), rating: draft.rating, content: draft.content.trim(), createdAt: now, local: true }, ...current]);
    } else {
      const { data, error: saveError } = await getSupabaseBrowserClient().from("product_reviews").insert({ product_slug: productSlug, user_id: user!.id, author: draft.author.trim(), rating: draft.rating, content: draft.content.trim() }).select("id,user_id,author,rating,content,created_at,updated_at").single();
      if (saveError) { setError("리뷰를 등록하지 못했습니다. 다시 시도해 주세요."); setSaving(false); return; }
      setReviews((current) => [mapRow(data as ReviewRow), ...current]);
    }
    setDraft({ author: userDisplayName(user), rating: 5, content: "" });
    setError(""); setMessage("리뷰가 등록되었습니다."); setSaving(false);
  };

  const startEditing = (review: ProductReview) => { setEditingId(review.id); setEditingDraft({ author: review.author, rating: review.rating, content: review.content }); setDeletingId(null); setMessage(""); setError(""); };

  const updateReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;
    const validationError = validate(editingDraft);
    if (validationError) { setError(validationError); return; }
    const target = reviews.find((review) => review.id === editingId);
    if (!target || !canManage(target)) return;
    setSaving(true);
    const updatedAt = new Date().toISOString();
    if (!offlineMode) {
      const { error: updateError } = await getSupabaseBrowserClient().from("product_reviews").update({ author: editingDraft.author.trim(), rating: editingDraft.rating, content: editingDraft.content.trim(), updated_at: updatedAt }).eq("id", editingId).eq("user_id", user!.id);
      if (updateError) { setError("리뷰를 수정하지 못했습니다."); setSaving(false); return; }
    }
    setReviews((current) => current.map((review) => review.id === editingId ? { ...review, ...editingDraft, author: editingDraft.author.trim(), content: editingDraft.content.trim(), updatedAt } : review));
    setEditingId(null); setError(""); setMessage("리뷰가 수정되었습니다."); setSaving(false);
  };

  const deleteReview = async (review: ProductReview) => {
    if (!canManage(review)) return;
    setSaving(true);
    if (!offlineMode) {
      const { error: deleteError } = await getSupabaseBrowserClient().from("product_reviews").delete().eq("id", review.id).eq("user_id", user!.id);
      if (deleteError) { setError("리뷰를 삭제하지 못했습니다."); setSaving(false); return; }
    }
    setReviews((current) => current.filter((item) => item.id !== review.id));
    setDeletingId(null); setError(""); setMessage("리뷰가 삭제되었습니다."); setSaving(false);
  };

  return <section className="shell product-reviews" id="product-reviews" aria-labelledby="product-reviews-title">
    <div className="product-reviews-heading"><div><h2 id="product-reviews-title">사용자 리뷰</h2><p>{productName}을 사용한 경험을 나눠주세요.</p></div><a href="#review-form">리뷰 작성</a></div>
    <div className="product-reviews-layout">
      <aside className="review-summary" aria-label="리뷰 평점 요약"><span>평균 평점</span><strong>{reviews.length ? average.toFixed(1) : "0.0"}</strong><div className="review-summary-stars" aria-label={`5점 만점에 ${average.toFixed(1)}점`}>{[1, 2, 3, 4, 5].map((rating) => <Star key={rating} size={20} weight={rating <= Math.round(average) ? "fill" : "regular"} />)}</div><p>{reviews.length}개의 리뷰</p><div className="review-distribution">{distribution.map(({ rating, count }) => <div key={rating}><span>{rating}점</span><div aria-hidden="true"><i style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} /></div><small>{count}</small></div>)}</div></aside>
      <div className="review-content">
        {configured && !authLoading && !user && !offlineMode ? <div className="review-login-prompt" id="review-form"><div><h3>로그인하고 리뷰를 남겨보세요.</h3><p>Google 계정으로 작성하면 다른 사용자에게도 리뷰가 공개됩니다.</p></div><button type="button" onClick={requestLogin}>Google 로그인</button></div> : <form className="review-form" id="review-form" onSubmit={addReview}><div className="review-form-heading"><h3>리뷰 작성</h3><p>{offlineMode ? "현재 리뷰는 이 브라우저에 저장됩니다." : "작성한 리뷰는 모든 사용자에게 공개됩니다."}</p></div><StarSelector value={draft.rating} onChange={(rating) => setDraft((current) => ({ ...current, rating }))} label="새 리뷰 별점" /><div className="review-form-fields"><label><span>작성자</span><input value={draft.author} maxLength={20} autoComplete="name" onChange={(event) => setDraft((current) => ({ ...current, author: event.target.value }))} /></label><label><span>리뷰 내용</span><textarea value={draft.content} rows={5} maxLength={500} onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))} /><small>{draft.content.length}/500</small></label></div><button className="review-submit-button" type="submit" disabled={saving}><Check size={19} weight="bold" /> {saving ? "등록 중" : "리뷰 등록"}</button></form>}
        <div className="review-feedback" aria-live="polite">{error && <p className="review-error" role="alert">{error}</p>}{message && <p>{message}</p>}</div>
        <div className="review-list" aria-busy={!ready}>{!ready && <div className="review-empty"><p>리뷰를 불러오고 있습니다.</p></div>}{ready && !reviews.length && <div className="review-empty"><Star size={30} /><h3>아직 등록된 리뷰가 없어요.</h3><p>이 상품을 먼저 사용해 본 경험을 남겨주세요.</p></div>}{ready && reviews.map((review) => <article className="review-item" key={review.id}>{editingId === review.id ? <form className="review-edit-form" onSubmit={updateReview}><StarSelector value={editingDraft.rating} onChange={(rating) => setEditingDraft((current) => ({ ...current, rating }))} label="수정할 리뷰 별점" /><label><span>작성자</span><input value={editingDraft.author} maxLength={20} onChange={(event) => setEditingDraft((current) => ({ ...current, author: event.target.value }))} /></label><label><span>리뷰 내용</span><textarea value={editingDraft.content} rows={4} maxLength={500} onChange={(event) => setEditingDraft((current) => ({ ...current, content: event.target.value }))} /></label><div><button type="submit" disabled={saving}><Check size={18} weight="bold" /> 수정 완료</button><button type="button" onClick={() => setEditingId(null)}><X size={18} /> 취소</button></div></form> : <><header><div><strong>{review.author}</strong><span>{formatDate(review.createdAt)}{review.updatedAt ? " 수정됨" : ""}</span></div><div className="review-item-stars" aria-label={`5점 만점에 ${review.rating}점`}>{[1, 2, 3, 4, 5].map((rating) => <Star key={rating} size={18} weight={rating <= review.rating ? "fill" : "regular"} />)}</div></header><p>{review.content}</p>{canManage(review) && (deletingId === review.id ? <div className="review-delete-confirm" role="alert"><span>이 리뷰를 삭제할까요?</span><button type="button" disabled={saving} onClick={() => void deleteReview(review)}>삭제</button><button type="button" onClick={() => setDeletingId(null)}>취소</button></div> : <div className="review-item-actions"><button type="button" onClick={() => startEditing(review)}><PencilSimple size={17} /> 수정</button><button type="button" onClick={() => setDeletingId(review.id)}><Trash size={17} /> 삭제</button></div>)}</>}</article>)}</div>
      </div>
    </div>
  </section>;
}

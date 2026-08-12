"use client";

import { Check, PencilSimple, Star, Trash, X } from "@phosphor-icons/react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ProductReview = {
  id: string;
  author: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

type ReviewDraft = {
  author: string;
  rating: number;
  content: string;
};

const emptyDraft: ReviewDraft = { author: "", rating: 5, content: "" };

function reviewStorageKey(productSlug: string) {
  return `drop-room-reviews:${productSlug}`;
}

function isReview(value: unknown): value is ProductReview {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const review = value as Partial<ProductReview>;
  return Boolean(
    typeof review.id === "string"
    && typeof review.author === "string"
    && typeof review.rating === "number"
    && review.rating >= 1
    && review.rating <= 5
    && typeof review.content === "string"
    && typeof review.createdAt === "string",
  );
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function StarSelector({ value, onChange, label }: { value: number; onChange: (rating: number) => void; label: string }) {
  return (
    <div className="review-star-selector" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`${rating}점`}
          className={rating <= value ? "active" : ""}
          onClick={() => onChange(rating)}
        >
          <Star size={25} weight={rating <= value ? "fill" : "regular"} />
        </button>
      ))}
      <strong>{value}.0</strong>
    </div>
  );
}

export function ProductReviews({ productSlug, productName }: { productSlug: string; productName: string }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [draft, setDraft] = useState<ReviewDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<ReviewDraft>(emptyDraft);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(reviewStorageKey(productSlug));
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setReviews(parsed.filter(isReview));
      }
    } catch {
      setError("저장된 리뷰를 불러오지 못했습니다.");
    } finally {
      setReady(true);
    }
  }, [productSlug]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(reviewStorageKey(productSlug), JSON.stringify(reviews));
  }, [productSlug, ready, reviews]);

  const average = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  const distribution = useMemo(
    () => [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter((review) => review.rating === rating).length,
    })),
    [reviews],
  );

  const validate = (value: ReviewDraft) => {
    if (!value.author.trim()) return "작성자 이름을 입력해 주세요.";
    if (value.content.trim().length < 5) return "리뷰를 5자 이상 입력해 주세요.";
    return "";
  };

  const addReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate(draft);
    if (validationError) {
      setError(validationError);
      setMessage("");
      return;
    }

    const now = new Date().toISOString();
    const review: ProductReview = {
      id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}`,
      author: draft.author.trim(),
      rating: draft.rating,
      content: draft.content.trim(),
      createdAt: now,
    };
    setReviews((current) => [review, ...current]);
    setDraft(emptyDraft);
    setError("");
    setMessage("리뷰가 등록되었습니다.");
  };

  const startEditing = (review: ProductReview) => {
    setEditingId(review.id);
    setEditingDraft({ author: review.author, rating: review.rating, content: review.content });
    setDeletingId(null);
    setMessage("");
    setError("");
  };

  const updateReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;
    const validationError = validate(editingDraft);
    if (validationError) {
      setError(validationError);
      setMessage("");
      return;
    }

    setReviews((current) => current.map((review) => review.id === editingId ? {
      ...review,
      author: editingDraft.author.trim(),
      rating: editingDraft.rating,
      content: editingDraft.content.trim(),
      updatedAt: new Date().toISOString(),
    } : review));
    setEditingId(null);
    setEditingDraft(emptyDraft);
    setError("");
    setMessage("리뷰가 수정되었습니다.");
  };

  const deleteReview = (reviewId: string) => {
    setReviews((current) => current.filter((review) => review.id !== reviewId));
    setDeletingId(null);
    if (editingId === reviewId) setEditingId(null);
    setError("");
    setMessage("리뷰가 삭제되었습니다.");
  };

  return (
    <section className="shell product-reviews" id="product-reviews" aria-labelledby="product-reviews-title">
      <div className="product-reviews-heading">
        <div>
          <h2 id="product-reviews-title">사용자 리뷰</h2>
          <p>{productName}을 사용한 경험을 나눠주세요.</p>
        </div>
        <a href="#review-form">리뷰 작성</a>
      </div>

      <div className="product-reviews-layout">
        <aside className="review-summary" aria-label="리뷰 평점 요약">
          <span>평균 평점</span>
          <strong>{reviews.length > 0 ? average.toFixed(1) : "0.0"}</strong>
          <div className="review-summary-stars" aria-label={`5점 만점에 ${average.toFixed(1)}점`}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Star key={rating} size={20} weight={rating <= Math.round(average) ? "fill" : "regular"} />
            ))}
          </div>
          <p>{reviews.length}개의 리뷰</p>
          <div className="review-distribution">
            {distribution.map(({ rating, count }) => (
              <div key={rating}>
                <span>{rating}점</span>
                <div aria-hidden="true"><i style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} /></div>
                <small>{count}</small>
              </div>
            ))}
          </div>
        </aside>

        <div className="review-content">
          <form className="review-form" id="review-form" onSubmit={addReview}>
            <div className="review-form-heading">
              <h3>리뷰 작성</h3>
              <p>별점과 함께 상품의 장점이나 사용 경험을 알려주세요.</p>
            </div>
            <StarSelector value={draft.rating} onChange={(rating) => setDraft((current) => ({ ...current, rating }))} label="새 리뷰 별점" />
            <div className="review-form-fields">
              <label>
                <span>작성자</span>
                <input
                  value={draft.author}
                  maxLength={20}
                  autoComplete="name"
                  onChange={(event) => setDraft((current) => ({ ...current, author: event.target.value }))}
                />
              </label>
              <label>
                <span>리뷰 내용</span>
                <textarea
                  value={draft.content}
                  rows={5}
                  maxLength={500}
                  onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
                />
                <small>{draft.content.length}/500</small>
              </label>
            </div>
            <button className="review-submit-button" type="submit"><Check size={19} weight="bold" /> 리뷰 등록</button>
          </form>

          <div className="review-feedback" aria-live="polite">
            {error && <p className="review-error" role="alert">{error}</p>}
            {message && <p>{message}</p>}
          </div>

          <div className="review-list" aria-busy={!ready}>
            {!ready && <div className="review-empty"><p>리뷰를 불러오고 있습니다.</p></div>}
            {ready && reviews.length === 0 && (
              <div className="review-empty">
                <Star size={30} />
                <h3>아직 등록된 리뷰가 없어요.</h3>
                <p>이 상품을 먼저 사용해 본 경험을 남겨주세요.</p>
              </div>
            )}
            {ready && reviews.map((review) => (
              <article className="review-item" key={review.id}>
                {editingId === review.id ? (
                  <form className="review-edit-form" onSubmit={updateReview}>
                    <StarSelector value={editingDraft.rating} onChange={(rating) => setEditingDraft((current) => ({ ...current, rating }))} label="수정할 리뷰 별점" />
                    <label>
                      <span>작성자</span>
                      <input value={editingDraft.author} maxLength={20} onChange={(event) => setEditingDraft((current) => ({ ...current, author: event.target.value }))} />
                    </label>
                    <label>
                      <span>리뷰 내용</span>
                      <textarea value={editingDraft.content} rows={4} maxLength={500} onChange={(event) => setEditingDraft((current) => ({ ...current, content: event.target.value }))} />
                    </label>
                    <div>
                      <button type="submit"><Check size={18} weight="bold" /> 수정 완료</button>
                      <button type="button" onClick={() => setEditingId(null)}><X size={18} /> 취소</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <header>
                      <div>
                        <strong>{review.author}</strong>
                        <span>{formatReviewDate(review.createdAt)}{review.updatedAt ? " 수정됨" : ""}</span>
                      </div>
                      <div className="review-item-stars" aria-label={`5점 만점에 ${review.rating}점`}>
                        {[1, 2, 3, 4, 5].map((rating) => <Star key={rating} size={18} weight={rating <= review.rating ? "fill" : "regular"} />)}
                      </div>
                    </header>
                    <p>{review.content}</p>
                    {deletingId === review.id ? (
                      <div className="review-delete-confirm" role="alert">
                        <span>이 리뷰를 삭제할까요?</span>
                        <button type="button" onClick={() => deleteReview(review.id)}>삭제</button>
                        <button type="button" onClick={() => setDeletingId(null)}>취소</button>
                      </div>
                    ) : (
                      <div className="review-item-actions">
                        <button type="button" onClick={() => startEditing(review)}><PencilSimple size={17} /> 수정</button>
                        <button type="button" onClick={() => setDeletingId(review.id)}><Trash size={17} /> 삭제</button>
                      </div>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

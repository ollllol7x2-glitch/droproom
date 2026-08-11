"use client";

import { ArrowClockwise, ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { products } from "@/data/products";
import { assetPath } from "@/lib/assets";
import { formatPrice } from "@/lib/format";

const recipients = ["친구", "연인", "나"];
const budgets = [10000, 30000, 50000];

const categoryPriority = {
  친구: ["hobby", "stationery", "fashion", "digital", "living", "room"],
  연인: ["room", "living", "fashion", "hobby", "digital", "stationery"],
  나: ["digital", "living", "hobby", "fashion", "stationery", "room"],
} as const;

export function GiftFinder() {
  const [recipient, setRecipient] = useState("친구");
  const [budget, setBudget] = useState(30000);
  const [pickIndex, setPickIndex] = useState(0);

  const picks = useMemo(() => {
    const available = products.filter((product) => (product.salePrice ?? product.price) <= budget);
    const priority = categoryPriority[recipient as keyof typeof categoryPriority];
    return [...available].sort(
      (a, b) => priority.indexOf(a.category) - priority.indexOf(b.category),
    );
  }, [recipient, budget]);

  const pick = picks[pickIndex % picks.length];

  const updateRecipient = (value: string) => {
    setRecipient(value);
    setPickIndex(0);
  };

  const updateBudget = (value: number) => {
    setBudget(value);
    setPickIndex(0);
  };

  return (
    <section className="gift-section" id="gift">
      <div className="shell gift-finder-v3">
        <div className="gift-finder-copy">
          <h2>선물 찾기</h2>
          <p>받는 사람과 예산을 누르면 바로 하나를 추천해 드려요.</p>
          <div className="gift-choices">
            <fieldset className="gift-choice-set">
              <legend>받는 사람</legend>
              <div className="gift-choice-options">
                {recipients.map((item) => (
                  <button
                    className={recipient === item ? "is-selected" : ""}
                    type="button"
                    aria-pressed={recipient === item}
                    key={item}
                    onClick={() => updateRecipient(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="gift-choice-set">
              <legend>최대 예산</legend>
              <div className="gift-choice-options">
                {budgets.map((item) => (
                  <button
                    className={budget === item ? "is-selected" : ""}
                    type="button"
                    aria-pressed={budget === item}
                    key={item}
                    onClick={() => updateBudget(item)}
                  >
                    {item / 10000}만원
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <button className="gift-refresh" type="button" onClick={() => setPickIndex((index) => index + 1)}>
            추천 바꾸기 <ArrowClockwise size={19} />
          </button>
        </div>
        {pick && (
          <div className="gift-pick" aria-live="polite" key={pick.id}>
            <Link className="gift-pick-image" href={`/product/${pick.slug}`}>
              <Image src={assetPath(pick.image)} alt={`${pick.name} 제품 이미지`} fill sizes="(max-width: 767px) 100vw, 42vw" style={{ objectFit: "cover", objectPosition: pick.imagePosition }} />
            </Link>
            <div className="gift-pick-info">
              <span>{recipient}에게 추천</span>
              <strong>{pick.name}</strong>
              <small>{formatPrice(pick.salePrice ?? pick.price)}</small>
              <Link href={`/product/${pick.slug}`}>이 선물 보기 <ArrowRight size={17} /></Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { Bag, Check, Heart, Minus, Plus, X } from "@phosphor-icons/react";
import { useState } from "react";
import { useStore } from "@/components/commerce/StoreProvider";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/format";

export function ProductPurchase({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(() =>
    product.colors[0] ? [{ name: product.colors[0], quantity: 1 }] : [],
  );
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);
  const hasOptions = product.colors.length > 0;
  const unitPrice = product.salePrice ?? product.price;
  const selectedQuantity = hasOptions
    ? selectedOptions.reduce((total, option) => total + option.quantity, 0)
    : quantity;
  const selectedTotal = unitPrice * selectedQuantity;

  const selectOption = (name: string) => {
    setSelectedOptions((current) => (
      current.some((option) => option.name === name)
        ? current
        : [...current, { name, quantity: 1 }]
    ));
    setAdded(false);
  };

  const updateOptionQuantity = (name: string, nextQuantity: number) => {
    setSelectedOptions((current) => current.map((option) => (
      option.name === name ? { ...option, quantity: Math.max(1, nextQuantity) } : option
    )));
    setAdded(false);
  };

  const removeOption = (name: string) => {
    setSelectedOptions((current) => current.filter((option) => option.name !== name));
    setAdded(false);
  };

  const add = () => {
    if (hasOptions) {
      selectedOptions.forEach((option) => addToCart(product.id, option.quantity, option.name));
    } else {
      addToCart(product.id, quantity);
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="purchase-panel">
      <div className="detail-badges">{product.badges.map((badge) => <span key={badge}>{badge}</span>)}</div>
      <p className="detail-brand">{product.brand}</p>
      <h1>{product.name}</h1>
      <p className="detail-description">{product.shortDescription}</p>
      <div className="detail-price">
        {product.salePrice && <del>{formatPrice(product.price)}</del>}
        <strong>{formatPrice(unitPrice)}</strong>
      </div>

      {hasOptions && <fieldset className="color-row">
        <legend>색상</legend>
        <div>{product.colors.map((color) => {
          const selected = selectedOptions.some((option) => option.name === color);
          return <button key={color} className={selected ? "active" : ""} type="button" aria-pressed={selected} onClick={() => selectOption(color)}>{selected && <Check size={15} weight="bold" />}{color}</button>;
        })}</div>
      </fieldset>}

      {hasOptions ? <section className="selected-options" aria-label="선택한 상품 옵션" aria-live="polite">
        <div className="selected-options-header">
          <strong>선택한 옵션</strong>
          <span>{selectedOptions.length}가지</span>
        </div>
        {selectedOptions.length > 0 ? <div className="selected-option-list">
          {selectedOptions.map((option) => <div className="selected-option-row" key={option.name}>
            <div className="selected-option-name"><small>색상</small><strong>{option.name}</strong></div>
            <div className="option-quantity">
              <button type="button" aria-label={`${option.name} 수량 줄이기`} onClick={() => updateOptionQuantity(option.name, option.quantity - 1)} disabled={option.quantity === 1}><Minus size={15} /></button>
              <output aria-label={`${option.name} 수량`}>{option.quantity}</output>
              <button type="button" aria-label={`${option.name} 수량 늘리기`} onClick={() => updateOptionQuantity(option.name, option.quantity + 1)}><Plus size={15} /></button>
            </div>
            <strong className="selected-option-price">{formatPrice(unitPrice * option.quantity)}</strong>
            <button className="selected-option-remove" type="button" aria-label={`${option.name} 옵션 삭제`} onClick={() => removeOption(option.name)}><X size={17} /></button>
          </div>)}
          <div className="selected-options-total"><span>총 {selectedQuantity}개</span><strong>{formatPrice(selectedTotal)}</strong></div>
        </div> : <p className="selected-options-empty">위에서 원하는 옵션을 선택해 주세요.</p>}
      </section> : <div className="quantity-row">
        <span>수량</span>
        <div>
          <button type="button" aria-label="수량 줄이기" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button>
          <output aria-live="polite">{quantity}</output>
          <button type="button" aria-label="수량 늘리기" onClick={() => setQuantity((value) => value + 1)}><Plus size={15} /></button>
        </div>
      </div>}

      <div className="purchase-actions">
        <button className="add-button" type="button" onClick={add} disabled={selectedQuantity === 0}>{added ? <><Check size={18} /> 총 {selectedQuantity}개 담았습니다</> : <><Bag size={18} /> {selectedQuantity > 0 ? `총 ${selectedQuantity}개 장바구니 담기` : "옵션을 선택해 주세요"}</>}</button>
        <button className={`detail-wish ${wishlisted ? "active" : ""}`} type="button" aria-label={wishlisted ? "찜 해제" : "찜하기"} onClick={() => toggleWishlist(product.id)}><Heart size={21} weight={wishlisted ? "fill" : "regular"} /></button>
      </div>

      <div className="curator-note"><span>CURATOR NOTE</span><p>{product.curatorNote}</p></div>
      <div className="detail-accordions">
        <details><summary>배송 안내</summary><p>평일 오후 2시 이전 주문은 다음 영업일부터 순차 발송됩니다.</p></details>
        <details><summary>교환과 반품</summary><p>수령 후 7일 안에 사용하지 않은 상품을 접수할 수 있습니다.</p></details>
      </div>
    </div>
  );
}

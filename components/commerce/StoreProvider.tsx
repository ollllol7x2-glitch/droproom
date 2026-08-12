"use client";

import { CheckCircle, Heart, X } from "@phosphor-icons/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { products } from "@/data/products";

export type CartLine = { productId: string; quantity: number; option?: string };

type StoreContextValue = {
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  addToCart: (productId: string, quantity?: number, option?: string) => void;
  removeFromCart: (productId: string, option?: string) => void;
  updateQuantity: (productId: string, quantity: number, option?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const CART_KEY = "drop-room-cart";
const WISHLIST_KEY = "drop-room-wishlist";
const productNames = new Map(products.map((product) => [product.id, product.name]));

type StoreToast = {
  id: number;
  kind: "cart" | "wishlist";
  title: string;
  message: string;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<StoreToast | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((nextToast: Omit<StoreToast, "id">) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ ...nextToast, id: Date.now() });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = null;
    setToast(null);
  }, []);

  useEffect(() => {
    try {
      const storedCart = window.localStorage.getItem(CART_KEY);
      const storedWishlist = window.localStorage.getItem(WISHLIST_KEY);
      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
    } catch {
      setCart([]);
      setWishlist([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, ready]);

  const addToCart = useCallback((productId: string, quantity = 1, option?: string) => {
    setCart((current) => {
      const existing = current.find((line) => line.productId === productId && line.option === option);
      if (existing) {
        return current.map((line) =>
          line.productId === productId && line.option === option
            ? { ...line, quantity: line.quantity + quantity }
            : line,
        );
      }
      return [...current, { productId, quantity, ...(option ? { option } : {}) }];
    });
    showToast({
      kind: "cart",
      title: productNames.get(productId) ?? "상품",
      message: `${option ? `${option} 옵션 · ` : ""}${quantity > 1 ? `${quantity}개 ` : ""}장바구니에 담았습니다.`,
    });
  }, [showToast]);

  const removeFromCart = useCallback((productId: string, option?: string) => {
    setCart((current) => current.filter((line) => !(line.productId === productId && line.option === option)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, option?: string) => {
    if (quantity < 1) {
      setCart((current) => current.filter((line) => !(line.productId === productId && line.option === option)));
      return;
    }
    setCart((current) =>
      current.map((line) =>
        line.productId === productId && line.option === option ? { ...line, quantity } : line,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    const removing = wishlist.includes(productId);
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
    showToast({
      kind: "wishlist",
      title: productNames.get(productId) ?? "상품",
      message: removing ? "찜 목록에서 삭제했습니다." : "찜 목록에 추가했습니다.",
    });
  }, [showToast, wishlist]);

  const value = useMemo(
    () => ({
      cart,
      wishlist,
      cartCount: cart.reduce((total, line) => total + line.quantity, 0),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted: (productId: string) => wishlist.includes(productId),
    }),
    [cart, wishlist, addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist],
  );

  return <StoreContext.Provider value={value}>
    {children}
    {toast && <div className="store-toast" key={toast.id} role="status" aria-live="polite" aria-atomic="true">
      <span className={`store-toast-icon store-toast-icon-${toast.kind}`} aria-hidden="true">{toast.kind === "wishlist" ? <Heart size={20} weight="fill" /> : <CheckCircle size={21} weight="fill" />}</span>
      <span className="store-toast-copy"><strong>{toast.title}</strong><span>{toast.message}</span></span>
      <button type="button" aria-label="알림 닫기" onClick={dismissToast}><X size={19} /></button>
    </div>}
  </StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}

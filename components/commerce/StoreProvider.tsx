"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

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
  }, []);

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
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }, []);

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

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}

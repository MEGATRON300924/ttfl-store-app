import AsyncStorage from "@react-native-async-storage/async-storage";
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
  quantity: number;
  stock: number;
  sellingMethod: "CHECKOUT" | "EXTERNAL_LINK" | "WHATSAPP";
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "ttfl.mobile.cart.v1";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setItems(parsed);
        } catch {
          // Ignore corrupted local cart data.
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    hydrated,
    addItem: (item, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((entry) => entry.productId === item.productId);
        if (!existing) return [...current, { ...item, quantity: Math.min(quantity, Math.max(1, item.stock)) }];
        const max = Math.max(1, existing.stock);
        return current.map((entry) => entry.productId === item.productId
          ? { ...entry, quantity: Math.min(max, entry.quantity + quantity) }
          : entry);
      });
    },
    updateQuantity: (productId, quantity) => {
      setItems((current) => current.flatMap((item) => {
        if (item.productId !== productId) return [item];
        if (quantity <= 0) return [];
        return [{ ...item, quantity: Math.min(quantity, Math.max(1, item.stock)) }];
      }));
    },
    removeItem: (productId) => setItems((current) => current.filter((item) => item.productId !== productId)),
    clear: () => setItems([]),
  }), [hydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

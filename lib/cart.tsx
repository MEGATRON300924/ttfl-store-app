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

export type DeliveryAddress = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  deliveryAddress: DeliveryAddress | null;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  setDeliveryAddress: (address: DeliveryAddress) => void;
  clearDeliveryAddress: () => void;
  clear: () => void;
};

const STORAGE_KEY = "ttfl.mobile.cart.v1";
const ADDRESS_STORAGE_KEY = "ttfl.mobile.delivery-address.v1";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddressState] = useState<DeliveryAddress | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(ADDRESS_STORAGE_KEY)])
      .then(([rawCart, rawAddress]) => {
        if (rawCart) {
          try {
            const parsed = JSON.parse(rawCart);
            if (Array.isArray(parsed)) setItems(parsed);
          } catch {
            // Ignore corrupted local cart data.
          }
        }
        if (rawAddress) {
          try {
            const parsed = JSON.parse(rawAddress);
            if (parsed && typeof parsed === "object") setDeliveryAddressState(parsed);
          } catch {
            // Ignore corrupted local address data.
          }
        }
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  useEffect(() => {
    if (!hydrated) return;
    if (deliveryAddress) void AsyncStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(deliveryAddress));
    else void AsyncStorage.removeItem(ADDRESS_STORAGE_KEY);
  }, [hydrated, deliveryAddress]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    hydrated,
    deliveryAddress,
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
    setDeliveryAddress: (address) => setDeliveryAddressState(address),
    clearDeliveryAddress: () => setDeliveryAddressState(null),
    clear: () => setItems([]),
  }), [deliveryAddress, hydrated, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

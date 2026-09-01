import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  PropsWithChildren,
} from "react";
import { useCategories } from "@/context/CategoriesContext";
import { FREE_DELIVERY_THRESHOLD, FLAT_DELIVERY_FEE } from "@/lib/domain";

export interface CartLine {
  categoryId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  setQuantity: (categoryId: string, name: string, unitPrice: number, quantity: number) => void;
  removeLine: (categoryId: string) => void;
  clear: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { categories } = useCategories();

  function setQuantity(categoryId: string, _name: string, _unitPrice: number, quantity: number) {
    setQuantities((prev) => {
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[categoryId];
        return next;
      }
      return { ...prev, [categoryId]: quantity };
    });
  }

  function removeLine(categoryId: string) {
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  }

  function clear() {
    setQuantities({});
  }

  const lines = useMemo<CartLine[]>(() => {
    return Object.entries(quantities)
      .map(([categoryId, quantity]) => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category) return null;
        return { categoryId, name: category.name, unitPrice: category.price, quantity };
      })
      .filter((line): line is CartLine => line !== null);
  }, [quantities, categories]);

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <CartContext.Provider
      value={{ lines, setQuantity, removeLine, clear, subtotal, deliveryFee, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

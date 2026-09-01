import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  PropsWithChildren,
} from "react";
import { useMenuItems } from "@/context/MenuItemsContext";
import { FREE_DELIVERY_THRESHOLD, FLAT_DELIVERY_FEE } from "@/lib/domain";

export interface CartLine {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  setQuantity: (menuItemId: string, quantity: number) => void;
  removeLine: (menuItemId: string) => void;
  clear: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { menuItems } = useMenuItems();

  function setQuantity(menuItemId: string, quantity: number) {
    setQuantities((prev) => {
      if (quantity <= 0) {
        const next = { ...prev };
        delete next[menuItemId];
        return next;
      }
      return { ...prev, [menuItemId]: quantity };
    });
  }

  function removeLine(menuItemId: string) {
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[menuItemId];
      return next;
    });
  }

  function clear() {
    setQuantities({});
  }

  const lines = useMemo<CartLine[]>(() => {
    return Object.entries(quantities)
      .map(([menuItemId, quantity]) => {
        const menuItem = menuItems.find((m) => m.id === menuItemId);
        if (!menuItem) return null;
        return { menuItemId, name: menuItem.name, unitPrice: menuItem.price, quantity };
      })
      .filter((line): line is CartLine => line !== null);
  }, [quantities, menuItems]);

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

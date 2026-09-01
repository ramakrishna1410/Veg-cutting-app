import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MenuItemDoc } from "@/lib/domain";

interface MenuItemsContextValue {
  menuItems: MenuItemDoc[];
  loading: boolean;
  getMenuItem: (id: string) => MenuItemDoc | undefined;
  getMenuItemsByCategory: (categoryId: string) => MenuItemDoc[];
}

const MenuItemsContext = createContext<MenuItemsContextValue | undefined>(undefined);

export function MenuItemsProvider({ children }: PropsWithChildren) {
  const [menuItems, setMenuItems] = useState<MenuItemDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "menuItems"), where("active", "==", true));
    return onSnapshot(q, (snap) => {
      setMenuItems(snap.docs.map((d) => d.data() as MenuItemDoc));
      setLoading(false);
    });
  }, []);

  function getMenuItem(id: string) {
    return menuItems.find((m) => m.id === id);
  }

  function getMenuItemsByCategory(categoryId: string) {
    return menuItems.filter((m) => m.categoryId === categoryId);
  }

  return (
    <MenuItemsContext.Provider value={{ menuItems, loading, getMenuItem, getMenuItemsByCategory }}>
      {children}
    </MenuItemsContext.Provider>
  );
}

export function useMenuItems(): MenuItemsContextValue {
  const ctx = useContext(MenuItemsContext);
  if (!ctx) throw new Error("useMenuItems must be used within MenuItemsProvider");
  return ctx;
}

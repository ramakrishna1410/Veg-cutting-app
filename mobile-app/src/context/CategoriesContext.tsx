import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CategoryDoc } from "@/lib/domain";

interface CategoriesContextValue {
  categories: CategoryDoc[];
  loading: boolean;
  getCategory: (id: string) => CategoryDoc | undefined;
}

const CategoriesContext = createContext<CategoriesContextValue | undefined>(undefined);

export function CategoriesProvider({ children }: PropsWithChildren) {
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "categories"),
      where("active", "==", true),
      orderBy("sortOrder", "asc")
    );
    return onSnapshot(q, (snap) => {
      setCategories(snap.docs.map((d) => d.data() as CategoryDoc));
      setLoading(false);
    });
  }, []);

  function getCategory(id: string) {
    return categories.find((c) => c.id === id);
  }

  return (
    <CategoriesContext.Provider value={{ categories, loading, getCategory }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories(): CategoriesContextValue {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}

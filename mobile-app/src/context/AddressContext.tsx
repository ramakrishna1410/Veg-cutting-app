import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AddressDoc } from "@/lib/domain";
import { useAuth } from "@/context/AuthContext";

interface AddressContextValue {
  addresses: AddressDoc[];
  loading: boolean;
  primaryAddress: AddressDoc | null;
}

const AddressContext = createContext<AddressContextValue | undefined>(undefined);

export function AddressProvider({ children }: PropsWithChildren) {
  const { appUser } = useAuth();
  const [addresses, setAddresses] = useState<AddressDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "addresses"), where("uid", "==", appUser.uid));
    return onSnapshot(q, (snap) => {
      setAddresses(snap.docs.map((d) => d.data() as AddressDoc));
      setLoading(false);
    });
  }, [appUser]);

  const primaryAddress = addresses.find((a) => a.isWithinServiceArea) ?? addresses[0] ?? null;

  return (
    <AddressContext.Provider value={{ addresses, loading, primaryAddress }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses(): AddressContextValue {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddresses must be used within AddressProvider");
  return ctx;
}

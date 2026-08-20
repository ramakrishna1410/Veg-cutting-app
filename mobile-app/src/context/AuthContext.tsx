import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";

export type UserRole = "customer" | "admin" | "delivery";

export interface AppUser {
  uid: string;
  role: UserRole;
  name: string;
  phone: string;
}

interface AuthContextValue {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  completeProfile: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setAppUser(null);
        setLoading(false);
        return;
      }
      const snap = await getDoc(doc(db, "users", user.uid));
      setAppUser(snap.exists() ? (snap.data() as AppUser) : null);
      setLoading(false);
    });
  }, []);

  async function completeProfile(name: string) {
    if (!firebaseUser) throw new Error("Not signed in");
    const newUser: AppUser = {
      uid: firebaseUser.uid,
      role: "customer",
      name,
      phone: firebaseUser.phoneNumber ?? "",
    };
    await setDoc(doc(db, "users", firebaseUser.uid), {
      ...newUser,
      createdAt: Date.now(),
    });
    setAppUser(newUser);
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, loading, completeProfile, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

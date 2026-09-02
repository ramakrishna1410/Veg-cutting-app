import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  PropsWithChildren,
} from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "@/lib/firebase";
import { OrderDoc, OrderStatus } from "@/lib/domain";
import { useAuth } from "@/context/AuthContext";

export interface AppNotification {
  id: string;
  orderId: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  toast: AppNotification | null;
  dismissToast: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const STATUS_COPY: Partial<Record<OrderStatus, { title: string; body: string }>> = {
  confirmed: { title: "Order confirmed", body: "We've confirmed your order and it's being packed." },
  out_for_delivery: { title: "Out for delivery", body: "Your order is on its way — tap to track it live." },
  delivered: { title: "Delivered", body: "Your order has been delivered. Enjoy!" },
  cancelled: { title: "Order cancelled", body: "This order was cancelled." },
};

function storageKey(uid: string) {
  return `notifications:${uid}`;
}

export function NotificationsProvider({ children }: PropsWithChildren) {
  const { appUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toast, setToast] = useState<AppNotification | null>(null);
  const prevStatuses = useRef<Map<string, OrderStatus>>(new Map());
  const loadedFromStorage = useRef(false);

  useEffect(() => {
    prevStatuses.current = new Map();
    loadedFromStorage.current = false;
    setNotifications([]);
    if (!appUser) return;

    AsyncStorage.getItem(storageKey(appUser.uid))
      .then((raw) => {
        if (raw) setNotifications(JSON.parse(raw));
      })
      .finally(() => {
        loadedFromStorage.current = true;
      });

    const q = query(collection(db, "orders"), where("uid", "==", appUser.uid));
    return onSnapshot(q, (snap) => {
      const isFirstLoad = prevStatuses.current.size === 0;
      const newOnes: AppNotification[] = [];

      snap.docs.forEach((d) => {
        const order = d.data() as OrderDoc;
        const prev = prevStatuses.current.get(order.id);
        prevStatuses.current.set(order.id, order.status);
        if (isFirstLoad || prev === order.status) return;
        const copy = STATUS_COPY[order.status];
        if (!copy) return;
        newOnes.push({
          id: `${order.id}-${order.status}-${Date.now()}`,
          orderId: order.id,
          title: copy.title,
          body: copy.body,
          createdAt: Date.now(),
          read: false,
        });
      });

      if (newOnes.length === 0) return;
      setNotifications((prevList) => {
        const merged = [...newOnes, ...prevList].slice(0, 50);
        AsyncStorage.setItem(storageKey(appUser.uid), JSON.stringify(merged)).catch(() => {});
        return merged;
      });
      setToast(newOnes[0]);
    });
  }, [appUser]);

  function markAllRead() {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      if (appUser) AsyncStorage.setItem(storageKey(appUser.uid), JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAllRead, toast, dismissToast: () => setToast(null) }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

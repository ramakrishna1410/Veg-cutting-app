import React, { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  Leaf,
  Users,
  Truck,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const ADMIN_NAV = [
  { to: "/orders", label: "Today's Orders", icon: ClipboardList },
  { to: "/categories", label: "Categories", icon: Leaf },
  { to: "/subscriptions", label: "Subscriptions", icon: Users },
];

export default function Layout({ children }: PropsWithChildren) {
  const { appUser, signOut } = useAuth();
  const isAdmin = appUser?.role === "admin";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="crest">VC</div>
          <div>
            <div className="brand-name">Veg Cutting App</div>
            <div className="brand-sub">Keelkattalai Hub</div>
          </div>
        </div>

        <nav className="nav">
          {isAdmin &&
            ADMIN_NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
              >
                <Icon size={17} /> {label}
              </NavLink>
            ))}
          <NavLink
            to="/delivery"
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <Truck size={17} /> My Deliveries
          </NavLink>
        </nav>

        <div className="sidebar-foot">
          <button className="nav-item" onClick={signOut}>
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="topbar">
          <span className="eyebrow">{appUser?.role === "admin" ? "Admin console" : "Delivery partner"}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="role-pill">{appUser?.role}</span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(180deg, var(--accent-bright), var(--accent))",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Newsreader', serif",
                fontWeight: 700,
                fontSize: 13.5,
              }}
            >
              {appUser?.name?.slice(0, 2).toUpperCase() ?? "?"}
            </div>
          </div>
        </div>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

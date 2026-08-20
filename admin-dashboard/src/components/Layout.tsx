import React, { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Layout({ children }: PropsWithChildren) {
  const { appUser, signOut } = useAuth();
  const isAdmin = appUser?.role === "admin";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
      <header style={headerStyle}>
        <span style={{ fontWeight: 700, color: "#2E7D32" }}>Veg Cutting App</span>
        <nav style={{ display: "flex", gap: 16 }}>
          {isAdmin && <NavLink to="/orders" style={navStyle}>Today's Orders</NavLink>}
          {isAdmin && <NavLink to="/categories" style={navStyle}>Categories</NavLink>}
          {isAdmin && <NavLink to="/subscriptions" style={navStyle}>Subscriptions</NavLink>}
          <NavLink to="/delivery" style={navStyle}>My Deliveries</NavLink>
        </nav>
        <button onClick={signOut} style={signOutStyle}>Sign out ({appUser?.role})</button>
      </header>
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 24,
  padding: "12px 24px",
  borderBottom: "1px solid #eee",
};

const navStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#333",
  fontSize: 14,
};

const signOutStyle: React.CSSProperties = {
  marginLeft: "auto",
  background: "none",
  border: "1px solid #ccc",
  borderRadius: 6,
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: 13,
};

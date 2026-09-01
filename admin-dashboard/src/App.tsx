import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import TodayOrdersPage from "@/pages/TodayOrdersPage";
import CategoriesPage from "@/pages/CategoriesPage";
import DeliveryViewPage from "@/pages/DeliveryViewPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Gate />
      </BrowserRouter>
    </AuthProvider>
  );
}

function Gate() {
  const { firebaseUser, appUser, loading } = useAuth();

  if (loading) {
    return <div className="auth-screen"><span className="eyebrow">Loading...</span></div>;
  }
  if (!firebaseUser || !appUser) return <LoginPage />;
  if (appUser.role !== "admin" && appUser.role !== "delivery") {
    return (
      <div className="auth-screen">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="auth-title">No access yet</div>
          <p className="auth-subtitle">This account doesn't have admin or delivery access.</p>
        </div>
      </div>
    );
  }

  const isAdmin = appUser.role === "admin";

  return (
    <Layout>
      <Routes>
        {isAdmin && <Route path="/orders" element={<TodayOrdersPage />} />}
        {isAdmin && <Route path="/categories" element={<CategoriesPage />} />}
        <Route path="/delivery" element={<DeliveryViewPage />} />
        <Route path="*" element={<Navigate to={isAdmin ? "/orders" : "/delivery"} replace />} />
      </Routes>
    </Layout>
  );
}

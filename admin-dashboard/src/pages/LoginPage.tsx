import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "80px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ color: "#2E7D32" }}>Veg Cutting App — Admin</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginTop: 16, fontSize: 13 }}>Email</label>
        <input
          style={inputStyle}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label style={{ display: "block", marginTop: 16, fontSize: 13 }}>Password</label>
        <input
          style={inputStyle}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "#C62828", fontSize: 13 }}>{error}</p>}
        <button style={buttonStyle} type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p style={{ fontSize: 12, color: "#777", marginTop: 16 }}>
        This account must have an admin or delivery role assigned in Firestore
        (users/&#123;uid&#125;.role).
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  fontSize: 14,
  border: "1px solid #ccc",
  borderRadius: 6,
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  marginTop: 24,
  width: "100%",
  padding: 12,
  fontSize: 15,
  fontWeight: 600,
  color: "#fff",
  backgroundColor: "#2E7D32",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

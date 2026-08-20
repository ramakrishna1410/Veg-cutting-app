import React, { useState } from "react";
import { Leaf, Lock, Mail } from "lucide-react";
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
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-crest">
          <Leaf size={26} />
        </div>
        <div className="auth-title">Veg Cutting App</div>
        <div className="auth-subtitle">Admin &amp; delivery console</div>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="field">
            <label>Email</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={iconStyle} />
              <input
                style={{ paddingLeft: 38 }}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="field">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={iconStyle} />
              <input
                style={{ paddingLeft: 38 }}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }} type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-note">
          This account needs an admin or delivery role assigned in Firestore
          (users/&#123;uid&#125;.role) before it can sign in here.
        </p>
      </div>
    </div>
  );
}

const iconStyle: React.CSSProperties = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--text-muted)",
};

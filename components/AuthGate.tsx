"use client";

import { useState, useEffect, type ReactNode } from "react";

interface AuthState {
  token: string | null;
  email: string | null;
  remaining: number;
}

export function useAuth(): AuthState & {
  setAuth: (token: string, email: string, remaining: number) => void;
  clearAuth: () => void;
} {
  const [auth, setAuthState] = useState<AuthState>({ token: null, email: null, remaining: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("probrief_auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAuthState(parsed);
      } catch { /* ignore */ }
    }
  }, []);

  const setAuth = (token: string, email: string, remaining: number) => {
    const state = { token, email, remaining };
    setAuthState(state);
    localStorage.setItem("probrief_auth", JSON.stringify(state));
  };

  const clearAuth = () => {
    setAuthState({ token: null, email: null, remaining: 0 });
    localStorage.removeItem("probrief_auth");
  };

  return { ...auth, setAuth, clearAuth };
}

export function AuthGate({ children }: { children: (auth: { token: string; email: string; remaining: number; updateRemaining: (n: number) => void; clearAuth: () => void }) => ReactNode }) {
  const { token, email, remaining, setAuth, clearAuth } = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [emailInput, setEmailInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const updateRemaining = (n: number) => {
    if (token && email) setAuth(token, email, n);
  };

  if (token && email) {
    return <>{children({ token, email, remaining, updateRemaining, clearAuth })}</>;
  }

  const sendCode = async () => {
    if (!emailInput.trim() || countdown > 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("code");
      setCountdown(60);
    } catch (e) {
      setError(e instanceof Error ? e.message : "发送失败");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!codeInput.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim(), code: codeInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAuth(data.token, emailInput.trim(), data.remaining);
    } catch (e) {
      setError(e instanceof Error ? e.message : "验证失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            验证邮箱开始使用
          </h2>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Verify your email to start · 3 free generations
          </p>
        </div>

        {step === "email" ? (
          <div className="space-y-3">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendCode()}
              placeholder="your@email.com"
              className="w-full px-4 py-3 outline-none rounded-lg text-sm"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={sendCode}
              disabled={loading || !emailInput.trim()}
              className="w-full py-3 text-sm font-medium rounded-full transition-all disabled:opacity-40"
              style={{ background: "var(--accent-indigo)", color: "#fff" }}
            >
              {loading ? "发送中..." : "发送验证码 Send Code"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
              验证码已发送至 <span className="font-medium">{emailInput}</span>
            </p>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && verifyCode()}
              placeholder="6 位验证码"
              maxLength={6}
              className="w-full px-4 py-3 outline-none rounded-lg text-sm text-center tracking-[0.5em] font-mono"
              style={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={verifyCode}
              disabled={loading || codeInput.length !== 6}
              className="w-full py-3 text-sm font-medium rounded-full transition-all disabled:opacity-40"
              style={{ background: "var(--accent-indigo)", color: "#fff" }}
            >
              {loading ? "验证中..." : "验证 Verify"}
            </button>
            <button
              onClick={sendCode}
              disabled={countdown > 0}
              className="w-full text-xs py-2"
              style={{ color: countdown > 0 ? "var(--text-tertiary)" : "var(--accent-indigo)" }}
            >
              {countdown > 0 ? `重新发送 (${countdown}s)` : "重新发送验证码"}
            </button>
          </div>
        )}

        {error && (
          <p className="text-xs text-center" style={{ color: "#ef4444" }}>{error}</p>
        )}
      </div>
    </div>
  );
}

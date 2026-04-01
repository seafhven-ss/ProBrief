"use client";

import BriefForm from "@/components/BriefForm";
import { AuthGate } from "@/components/AuthGate";
import Link from "next/link";

export default function BuilderPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--border-default)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-light tracking-tight" style={{ color: "var(--text-primary)" }}>
            Pro<span className="font-semibold">Brief</span>
          </Link>
          <span
            className="text-[10px] tracking-[0.2em] uppercase px-3 py-1"
            style={{
              color: "var(--text-tertiary)",
              border: "1px solid var(--border-default)",
            }}
          >
            演示版 Demo
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
            从模糊想法到<span className="font-semibold">结构化提案</span>
          </h1>
          <p className="text-xs tracking-wide mb-3" style={{ color: "var(--text-tertiary)" }}>
            From a vague idea to a <span className="font-medium" style={{ color: "var(--text-secondary)" }}>structured brief</span>
          </p>
          <p className="text-sm max-w-xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            用自然语言描述你的项目，系统自动提取需求、识别缺失、标记风险、推荐提案方向。
            <br />
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Describe your project in natural language — the system extracts requirements, identifies gaps, flags risks, and suggests directions.</span>
          </p>
        </div>

        <AuthGate>
          {({ token, remaining, updateRemaining, clearAuth }) => (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {remaining > 0
                    ? `剩余 ${remaining} 次免费生成`
                    : "免费额度已用完，联系 seafhven@gmail.com 获取更多"}
                </p>
                <button
                  onClick={clearAuth}
                  className="text-xs px-3 py-1 rounded-full transition-colors"
                  style={{ color: "var(--text-tertiary)", border: "1px solid var(--border-default)" }}
                >
                  退出 Logout
                </button>
              </div>
              <BriefForm
                token={token}
                remaining={remaining}
                onRemainingChange={updateRemaining}
                onAuthExpired={clearAuth}
              />
            </>
          )}
        </AuthGate>
      </div>
    </main>
  );
}

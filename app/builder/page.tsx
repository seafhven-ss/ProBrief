import BriefForm from "@/components/BriefForm";
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
          <p
            className="mt-3 text-xs rounded-lg px-3 py-2"
            style={{
              color: "var(--text-tertiary)",
              border: "1px solid var(--border-default)",
              background: "var(--bg-secondary)",
            }}
          >
            This is a demo prototype for early-stage brief structuring and proposal direction, not a final costing/review/construction system.
          </p>
        </div>
        <BriefForm />
      </div>
    </main>
  );
}

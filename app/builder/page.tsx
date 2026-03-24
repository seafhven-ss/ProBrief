import BriefForm from "@/components/BriefForm";
import Link from "next/link";

export default function BuilderPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-neutral-800/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-light tracking-tight">
            Pro<span className="font-semibold">Brief</span>
          </Link>
          <span className="text-[10px] tracking-[0.2em] uppercase text-neutral-600 border border-neutral-800 px-3 py-1">
            演示版 Demo
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2">
            从模糊想法到<span className="font-semibold">结构化提案</span>
          </h1>
          <p className="text-neutral-600 text-xs tracking-wide mb-3">
            From a vague idea to a <span className="font-medium text-neutral-500">structured brief</span>
          </p>
          <p className="text-neutral-500 text-sm max-w-xl leading-relaxed">
            用自然语言描述你的项目，系统自动提取需求、识别缺失、标记风险、推荐提案方向。
            <br />
            <span className="text-neutral-600 text-xs">Describe your project in natural language — the system extracts requirements, identifies gaps, flags risks, and suggests directions.</span>
          </p>
        </div>
        <BriefForm />
      </div>
    </main>
  );
}

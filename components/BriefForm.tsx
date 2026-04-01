"use client";

import { useState } from "react";
import type { BriefInput, BriefOutput } from "@/lib/types";
import { generateBrief, AuthError, QuotaError } from "@/lib/generator";
import OutputCard from "./OutputCard";

const PROJECT_TYPES = [
  { value: "零售门店", label: "零售门店 Retail Store" },
  { value: "展会展台", label: "展会展台 Exhibition Booth" },
  { value: "品牌快闪", label: "品牌快闪 Brand Pop-up" },
  { value: "商业空间升级", label: "商业空间升级 Commercial Upgrade" },
  { value: "办公/展示空间", label: "办公/展示空间 Office & Showroom" },
  { value: "其他", label: "其他 Other" },
];

const EXAMPLES: { label: string; type: string; description: string; budget?: string; timeline?: string }[] = [
  {
    label: "零售 1",
    type: "零售门店",
    description: "我们准备在商场开一家女装集合店，面积大约120㎡，希望空间有高级感，但整体预算要控制，工期也希望快一点。",
    budget: "12万",
    timeline: "11月开业",
  },
  {
    label: "零售 2",
    type: "零售门店",
    description: "我们要做一家100㎡咖啡轻食店，希望品牌形象干净、年轻、有质感，同时尽量控制投入。",
    budget: "5万",
    timeline: "12月开业",
  },
  {
    label: "展台 1",
    type: "展会展台",
    description: "我们要参加一个科技展，希望展台简洁、大气、有科技感，现场兼顾接待和展示功能，时间比较紧。",
    budget: "20万",
    timeline: "12月展会",
  },
  {
    label: "展台 2",
    type: "展会展台",
    description: "我们要做一个40㎡品牌展台，希望有记忆点，方便快速搭建，同时展示两款核心产品。",
    budget: "15万",
    timeline: "11月布展",
  },
  {
    label: "商业 1",
    type: "商业空间升级",
    description: "我们现有门店想做局部升级，不想全部重装，希望重点优化门头、主展示区和整体形象，同时尽量减少停业时间。",
    budget: "18万",
    timeline: "January start",
  },
  {
    label: "商业 2",
    type: "办公/展示空间",
    description: "我们要把办公室前场升级为接待加展示空间，希望更有品牌感，但不希望改造范围过大。",
    budget: "25万",
    timeline: "6月启动",
  },
];

const inputStyle: React.CSSProperties = {
  background: "var(--bg-panel)",
  border: "1px solid var(--border-default)",
  color: "var(--text-primary)",
  borderRadius: "var(--radius-md)",
};

const inputFocusClass = "w-full px-4 py-2 outline-none transition-colors duration-200";

export default function BriefForm({ token, remaining, onRemainingChange, onAuthExpired }: {
  token?: string;
  remaining?: number;
  onRemainingChange?: (n: number) => void;
  onAuthExpired?: () => void;
}) {
  const [input, setInput] = useState<BriefInput>({
    projectName: "",
    projectType: "",
    description: "",
    budget: "",
    timeline: "",
  });
  const [output, setOutput] = useState<BriefOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.projectType || !input.description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateBrief(input, token);
      setOutput(result.output);
      if (result.remaining !== undefined) onRemainingChange?.(result.remaining);
    } catch (err) {
      setOutput(null);
      if (err instanceof AuthError) {
        onAuthExpired?.();
        return;
      }
      setError(err instanceof Error ? err.message : "生成失败，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  const fillExample = (ex: (typeof EXAMPLES)[number]) => {
    setInput({
      ...input,
      projectType: ex.type,
      description: ex.description,
      budget: ex.budget || "",
      timeline: ex.timeline || "",
    });
    setError(null);
    setOutput(null);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            项目名称 Project Name <span className="font-normal" style={{ color: "var(--text-tertiary)" }}>（可选 optional）</span>
          </label>
          <input
            type="text"
            value={input.projectName}
            onChange={(e) => setInput({ ...input, projectName: e.target.value })}
            className={inputFocusClass}
            style={inputStyle}
            placeholder="例如：XX 品牌苏州中心店"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>项目类型 Project Type</label>
          <select
            value={input.projectType}
            onChange={(e) => setInput({ ...input, projectType: e.target.value })}
            className={inputFocusClass}
            style={inputStyle}
          >
            <option value="">选择类型 Select Type</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            项目需求描述 Description<span style={{ color: "#ef4444" }}>*</span>
          </label>
          <p className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>
            用自然语言描述项目需求，写得越具体，生成的 brief 越准确。
          </p>
          <textarea
            value={input.description}
            onChange={(e) => setInput({ ...input, description: e.target.value })}
            className="w-full px-4 py-3 outline-none resize-none transition-colors duration-200"
            style={inputStyle}
            rows={6}
            placeholder="例如：我们准备在商场开一家店，面积大约120㎡，希望空间有高级感……"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => fillExample(ex)}
                className="px-3 py-1 text-xs rounded-full transition-colors duration-200"
                style={{
                  border: "1px solid var(--border-default)",
                  color: "var(--text-tertiary)",
                  background: "transparent",
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            预算情况 Budget <span className="font-normal" style={{ color: "var(--text-tertiary)" }}>（可选 optional）</span>
          </label>
          <input
            type="text"
            value={input.budget}
            onChange={(e) => setInput({ ...input, budget: e.target.value })}
            className={inputFocusClass}
            style={inputStyle}
            placeholder="例如：5万 / 10-15万 / 预算有限"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            时间要求 Timeline <span className="font-normal" style={{ color: "var(--text-tertiary)" }}>（可选 optional）</span>
          </label>
          <input
            type="text"
            value={input.timeline}
            onChange={(e) => setInput({ ...input, timeline: e.target.value })}
            className={inputFocusClass}
            style={inputStyle}
            placeholder="例如：11月开业 / December start / 尽快"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !input.projectType || !input.description.trim()}
          className="w-full py-3 font-medium rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "var(--accent-indigo)",
            color: "#ffffff",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
              生成中 Generating...
            </span>
          ) : (
            <span className="flex flex-col items-center leading-tight">
              <span>生成提案</span>
              <span className="text-[10px] opacity-60 tracking-widest font-normal">GENERATE BRIEF</span>
            </span>
          )}
        </button>
        {remaining !== undefined && (
          <p className="text-center text-xs mt-2" style={{ color: remaining > 0 ? "var(--text-tertiary)" : "#ef4444" }}>
            {remaining > 0 ? `剩余 ${remaining} 次免费生成 / ${remaining} free generation(s) left` : "免费额度已用完 / Free quota exhausted"}
          </p>
        )}
      </form>

      <div>
        {output ? (
          <OutputCard output={output} />
        ) : error ? (
          <div
            className="rounded-lg min-h-[500px] p-6 flex flex-col justify-center"
            style={{
              border: "1px solid rgba(239, 68, 68, 0.3)",
              background: "rgba(239, 68, 68, 0.08)",
            }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: "#ef4444" }}>生成失败</p>
            <p className="text-[10px] tracking-wide uppercase mb-3" style={{ color: "rgba(239, 68, 68, 0.5)" }}>GENERATION FAILED</p>
            <p className="text-sm leading-relaxed" style={{ color: "#fca5a5" }}>{error}</p>
          </div>
        ) : (
          <div
            className="h-full flex flex-col items-center justify-center rounded-lg min-h-[500px] px-8"
            style={{
              border: "1px dashed var(--border-default)",
            }}
          >
            <div className="w-8 h-px mb-6" style={{ background: "var(--border-default)" }} />
            <p className="text-xs tracking-wide mb-1" style={{ color: "var(--text-tertiary)" }}>输出区域</p>
            <p className="text-[10px] tracking-widest uppercase mb-4" style={{ color: "var(--text-tertiary)" }}>OUTPUT AREA</p>
            <p className="text-xs text-center max-w-xs leading-relaxed mb-1" style={{ color: "var(--text-secondary)" }}>
              填写项目描述并选择类型，系统将自动生成结构化项目提案。
            </p>
            <p className="text-[11px] text-center max-w-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              Fill in the description and select a type to generate a structured brief.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

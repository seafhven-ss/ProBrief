"use client";

import { useState } from "react";
import type { BriefInput, BriefOutput } from "@/lib/types";
import { generateBrief } from "@/lib/generator";
import OutputCard from "./OutputCard";

const PROJECT_TYPES = ["零售门店", "展会展台", "品牌快闪", "商业空间升级", "办公/展示空间", "其他"];

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

export default function BriefForm() {
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
      const result = await generateBrief(input);
      setOutput(result);
    } catch (err) {
      setOutput(null);
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
    <div className="grid md:grid-cols-2 gap-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="项目名称" optional>
          <input
            type="text"
            value={input.projectName}
            onChange={(e) => setInput({ ...input, projectName: e.target.value })}
            className="w-full px-4 py-2.5 border rounded-none text-sm"
            placeholder="例如：XX 品牌苏州中心店"
          />
        </FormField>

        <FormField label="项目类型">
          <select
            value={input.projectType}
            onChange={(e) => setInput({ ...input, projectType: e.target.value })}
            className="w-full px-4 py-2.5 border rounded-none text-sm"
          >
            <option value="">选择类型</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="项目需求描述" required hint="用自然语言描述项目需求，写得越具体，生成的 brief 越准确。">
          <textarea
            value={input.description}
            onChange={(e) => setInput({ ...input, description: e.target.value })}
            className="w-full px-4 py-3 border rounded-none text-sm resize-none"
            rows={6}
            placeholder="例如：我们准备在商场开一家店，面积大约120㎡，希望空间有高级感……"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => fillExample(ex)}
                className="px-3 py-1 text-[11px] border border-neutral-700 hover:border-neutral-500 hover:text-white transition-colors text-neutral-500 tracking-wide"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="预算情况" optional>
          <input
            type="text"
            value={input.budget}
            onChange={(e) => setInput({ ...input, budget: e.target.value })}
            className="w-full px-4 py-2.5 border rounded-none text-sm"
            placeholder="例如：5万 / 10-15万 / 预算有限"
          />
        </FormField>

        <FormField label="时间要求" optional>
          <input
            type="text"
            value={input.timeline}
            onChange={(e) => setInput({ ...input, timeline: e.target.value })}
            className="w-full px-4 py-2.5 border rounded-none text-sm"
            placeholder="例如：11月开业 / December start / 尽快"
          />
        </FormField>

        <button
          type="submit"
          disabled={loading || !input.projectType || !input.description.trim()}
          className="w-full py-3.5 bg-white text-black text-sm font-medium tracking-wide uppercase hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border border-black/30 border-t-black rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            "Generate Brief"
          )}
        </button>
      </form>

      <div>
        {output ? (
          <OutputCard output={output} />
        ) : error ? (
          <div className="border border-red-900/50 bg-red-950/30 min-h-[500px] p-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-red-400 mb-2">Generation Failed</p>
            <p className="text-sm text-red-400/70 leading-relaxed">{error}</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center border border-dashed border-neutral-800 min-h-[500px] px-8">
            <div className="w-8 h-px bg-neutral-700 mb-6" />
            <p className="text-neutral-600 text-xs tracking-wide uppercase mb-2">Output Area</p>
            <p className="text-neutral-700 text-xs text-center max-w-xs leading-relaxed">
              Fill in the project description and select a type. The system will generate a structured project brief.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({
  label,
  optional,
  required,
  hint,
  children,
}: {
  label: string;
  optional?: boolean;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium tracking-wide uppercase text-neutral-400 mb-2">
        {label}
        {optional && <span className="text-neutral-600 font-normal lowercase tracking-normal ml-2">optional</span>}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-[11px] text-neutral-600 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

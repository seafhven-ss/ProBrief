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
    <div className="grid md:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            项目名称 <span className="text-gray-400 font-normal">（可选）</span>
          </label>
          <input
            type="text"
            value={input.projectName}
            onChange={(e) => setInput({ ...input, projectName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
            placeholder="例如：XX 品牌苏州中心店"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">项目类型</label>
          <select
            value={input.projectType}
            onChange={(e) => setInput({ ...input, projectType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          >
            <option value="">选择类型</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            项目需求描述<span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            用自然语言描述项目需求，写得越具体，生成的 brief 越准确。
          </p>
          <textarea
            value={input.description}
            onChange={(e) => setInput({ ...input, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none"
            rows={6}
            placeholder="例如：我们准备在商场开一家店，面积大约120㎡，希望空间有高级感……"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => fillExample(ex)}
                className="px-3 py-1 text-xs border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors text-gray-500"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            预算情况 <span className="text-gray-400 font-normal">（可选）</span>
          </label>
          <input
            type="text"
            value={input.budget}
            onChange={(e) => setInput({ ...input, budget: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
            placeholder="例如：5万 / 10-15万 / 预算有限"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            时间要求 <span className="text-gray-400 font-normal">（可选）</span>
          </label>
          <input
            type="text"
            value={input.timeline}
            onChange={(e) => setInput({ ...input, timeline: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
            placeholder="例如：11月开业 / December start / 尽快"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !input.projectType || !input.description.trim()}
          className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "生成中..." : "生成项目 Brief"}
        </button>
      </form>

      <div>
        {output ? (
          <OutputCard output={output} />
        ) : error ? (
          <div className="border border-red-200 bg-red-50 rounded-lg min-h-[500px] p-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-red-700 mb-2">生成失败</p>
            <p className="text-sm text-red-600 leading-relaxed">{error}</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-lg min-h-[500px] px-6">
            <p className="text-gray-300 text-sm mb-1">输出区域</p>
            <p className="text-gray-300 text-xs text-center">
              填写左侧需求描述并选择项目类型后，系统会生成结构化项目 Brief。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { BriefInput } from "@/lib/types";
import OutputCard from "./OutputCard";

const projectTypes = ["网站", "App", "品牌设计", "营销活动", "产品", "其他"];
const tones = ["专业", "友好", "高端", "活泼", "简约", "权威"];

export default function BriefForm() {
  const [input, setInput] = useState<BriefInput>({
    projectName: "",
    projectType: "",
    targetAudience: "",
    keyMessage: "",
    tone: "",
    deliverables: [],
  });

  const [generated, setGenerated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerated(true);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">项目名称</label>
          <input
            type="text"
            value={input.projectName}
            onChange={(e) => setInput({ ...input, projectName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
            placeholder="输入项目名称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">项目类型</label>
          <select
            value={input.projectType}
            onChange={(e) => setInput({ ...input, projectType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          >
            <option value="">选择类型</option>
            {projectTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">目标受众</label>
          <input
            type="text"
            value={input.targetAudience}
            onChange={(e) => setInput({ ...input, targetAudience: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
            placeholder="描述你的目标用户"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">核心信息</label>
          <textarea
            value={input.keyMessage}
            onChange={(e) => setInput({ ...input, keyMessage: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none"
            rows={3}
            placeholder="你想传达的核心信息"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">语气风格</label>
          <select
            value={input.tone}
            onChange={(e) => setInput({ ...input, tone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
          >
            <option value="">选择风格</option>
            {tones.map((tone) => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          生成提案
        </button>
      </form>

      <div>
        {generated ? (
          <OutputCard />
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed border-gray-200 rounded-lg min-h-[400px]">
            <p className="text-gray-400 text-sm">输出区域</p>
          </div>
        )}
      </div>
    </div>
  );
}

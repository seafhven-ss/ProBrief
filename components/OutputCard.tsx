"use client";

import type { BriefOutput, FactsSnapshotDebug, FilteredItemDebug, RuleDebugEntry } from "@/lib/types";
import { useState } from "react";

const SEVERITY_COLOR: Record<string, string> = {
  high: "text-red-600 bg-red-50",
  medium: "text-yellow-700 bg-yellow-50",
  low: "text-green-700 bg-green-50",
};

const IMPACT_COLOR: Record<string, string> = {
  blocking: "text-red-600 bg-red-50",
  important: "text-yellow-700 bg-yellow-50",
  optional: "text-gray-500 bg-gray-50",
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "text-red-600",
  medium: "text-yellow-700",
  low: "text-gray-400",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

export default function OutputCard({ output }: { output: BriefOutput }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPlainText(output));
  };

  const handleDownload = () => {
    const text = buildPlainText(output);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${output.summary.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-6 min-h-[500px]">
      <section>
        <SectionLabel>1. 项目概述</SectionLabel>
        <h2 className="text-lg font-semibold mb-1">{output.summary.title}</h2>
        <p className="text-gray-700 text-sm leading-relaxed">{output.summary.overview}</p>
        <div className="mt-2">
          <Tag>{output.summary.projectType}</Tag>
        </div>
      </section>

      <section>
        <SectionLabel>2. 关键需求拆解</SectionLabel>
        <ul className="space-y-2">
          {output.requirements.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className={`mt-0.5 font-semibold shrink-0 ${PRIORITY_COLOR[r.priority]}`}>
                [{PRIORITY_LABEL[r.priority]}]
              </span>
              <span>
                <span className="font-medium">{r.category}：</span>
                <span className="text-gray-600">{r.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {output.missingInfo.length > 0 && (
        <section>
          <SectionLabel>3. 当前缺失信息</SectionLabel>
          <ul className="space-y-2">
            {output.missingInfo.map((m, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${IMPACT_COLOR[m.impact]}`}>
                  {m.impact === "blocking" ? "阻塞" : m.impact === "important" ? "重要" : "可选"}
                </span>
                <span>
                  <span className="font-medium">{m.field}：</span>
                  <span className="text-gray-600">{m.reason}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionLabel>4. 风险与难点</SectionLabel>
        <ul className="space-y-2">
          {output.risks.map((r, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className={`shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${SEVERITY_COLOR[r.severity]}`}>
                {r.severity === "high" ? "高" : r.severity === "medium" ? "中" : "低"}
              </span>
              <span>
                <span className="font-medium">{r.type}：</span>
                <span className="text-gray-600">{r.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionLabel>5. 下一步建议</SectionLabel>
        <ol className="space-y-2">
          {output.nextSteps.map((s) => (
            <li key={s.order} className="text-sm flex gap-3">
              <span className="shrink-0 w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-medium">
                {s.order}
              </span>
              <span>
                <span className="text-gray-800">{s.action}</span>
                <span className="text-gray-400 ml-2">- {s.owner}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {output.proposalAngles.length > 0 && (
        <section>
          <SectionLabel>6. 提案切入建议</SectionLabel>
          <div className="space-y-3">
            {output.proposalAngles.map((a, i) => (
              <div key={i} className="text-sm border-l-2 border-gray-200 pl-3">
                <p className="font-medium text-gray-800">{a.angle}</p>
                <p className="text-gray-500 mt-0.5">{a.reasoning}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="pt-4 border-t border-gray-100 flex gap-3">
        <button onClick={handleCopy} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
          复制
        </button>
        <button onClick={handleDownload} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
          下载
        </button>
      </div>

      {(output.ruleDebug || output.factsDebug || output.filteredDebug) && (
        <FullDebugPanel
          ruleEntries={output.ruleDebug}
          facts={output.factsDebug}
          filteredItems={output.filteredDebug}
          demoSafeMode={output.demoSafeMode}
        />
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{children}</h3>;
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{children}</span>;
}

function FullDebugPanel({
  ruleEntries,
  facts,
  filteredItems,
  demoSafeMode,
}: {
  ruleEntries?: RuleDebugEntry[];
  facts?: FactsSnapshotDebug;
  filteredItems?: FilteredItemDebug[];
  demoSafeMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hitCount = ruleEntries?.filter((e) => e.matched).length ?? 0;
  const totalRules = ruleEntries?.length ?? 0;
  const removedCount = filteredItems?.filter((f) => f.action === "removed").length ?? 0;

  return (
    <div className="border-t border-dashed border-gray-200 pt-4">
      <button onClick={() => setOpen(!open)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
        <span>{open ? "▾" : "▸"}</span>
        <span>
          调试面板（规则 {hitCount}/{totalRules} 命中{removedCount > 0 ? `，过滤 ${removedCount} 项` : ""}{demoSafeMode ? "，SafeMode ON" : ""}）
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-4">
          {facts && (
            <div>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Extracted Facts</div>
              <div className="text-xs bg-blue-50 border border-blue-100 rounded px-3 py-2 grid grid-cols-2 gap-x-4 gap-y-1">
                <span>visualIdentity: <b>{facts.visualIdentityStatus}</b></span>
                <span>budget: <b>{facts.budgetStatus}</b></span>
                <span>timeline: <b>{facts.timelineStatus}</b></span>
                <span>customerGroup: <b>{facts.customerGroupKnown ? "yes" : "no"}</b></span>
                <span>area: <b>{facts.areaKnown ? facts.areaValue : "unknown"}</b></span>
                <span>scene: <b>{facts.projectScene || "-"}</b></span>
                <span>regions: <b>{facts.regionNormalized.length > 0 ? facts.regionNormalized.join(", ") : "none"}</b></span>
                <span>months: <b>{facts.monthDetected.length > 0 ? facts.monthDetected.map((m) => `${m}月`).join(", ") : "none"}</b></span>
              </div>
            </div>
          )}

          {filteredItems && filteredItems.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Filtered Items</div>
              <div className="space-y-1">
                {filteredItems.map((f, i) => (
                  <div key={i} className={`text-xs rounded px-3 py-1.5 ${f.action === "removed" ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"}`}>
                    <span className={`font-mono font-semibold ${f.action === "removed" ? "text-red-600" : "text-yellow-600"}`}>
                      {f.action === "removed" ? "DEL" : "RWD"}
                    </span>{" "}
                    <span className="text-gray-500">[{f.type}]</span>{" "}
                    <span className="font-medium text-gray-700">{f.original}</span>
                    <span className="text-gray-400"> - {f.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function buildPlainText(o: BriefOutput): string {
  const lines: string[] = [];
  lines.push(`《${o.summary.title}》`);
  lines.push(`生成时间：${new Date(o.generatedAt).toLocaleString("zh-CN")}`);
  lines.push("");
  lines.push("=== 1. 项目概述 ===");
  lines.push(o.summary.overview);
  lines.push(`类型：${o.summary.projectType}`);
  lines.push("");
  lines.push("=== 2. 关键需求拆解 ===");
  for (const r of o.requirements) lines.push(`[${PRIORITY_LABEL[r.priority]}] ${r.category}：${r.description}`);
  lines.push("");
  if (o.missingInfo.length > 0) {
    lines.push("=== 3. 当前缺失信息 ===");
    for (const m of o.missingInfo) lines.push(`[${m.impact}] ${m.field}：${m.reason}`);
    lines.push("");
  }
  lines.push("=== 4. 风险与难点 ===");
  for (const r of o.risks) lines.push(`[${r.severity}] ${r.type}：${r.description}`);
  lines.push("");
  lines.push("=== 5. 下一步建议 ===");
  for (const s of o.nextSteps) lines.push(`${s.order}. ${s.action}（${s.owner}）`);
  lines.push("");
  if (o.proposalAngles.length > 0) {
    lines.push("=== 6. 提案切入建议 ===");
    for (const a of o.proposalAngles) lines.push(`- ${a.angle}：${a.reasoning}`);
  }
  return lines.join("\n");
}

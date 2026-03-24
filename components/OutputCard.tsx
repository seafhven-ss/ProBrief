"use client";

import type { BriefOutput, FactsSnapshotDebug, FilteredItemDebug, RuleDebugEntry } from "@/lib/types";
import { useState } from "react";

const SEVERITY_STYLE: Record<string, string> = {
  high: "text-red-400 bg-red-950/50 border-red-900/50",
  medium: "text-amber-400 bg-amber-950/50 border-amber-900/50",
  low: "text-emerald-400 bg-emerald-950/50 border-emerald-900/50",
};

const IMPACT_STYLE: Record<string, string> = {
  blocking: "text-red-400 bg-red-950/50 border-red-900/50",
  important: "text-amber-400 bg-amber-950/50 border-amber-900/50",
  optional: "text-neutral-400 bg-neutral-900/50 border-neutral-800",
};

const PRIORITY_STYLE: Record<string, string> = {
  high: "text-red-400",
  medium: "text-amber-400",
  low: "text-neutral-500",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "HIGH",
  medium: "MED",
  low: "LOW",
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
    <div className="border border-neutral-800 p-6 space-y-8 min-h-[500px]">
      <section>
        <SectionLabel num="01">Project Overview</SectionLabel>
        <h2 className="text-xl font-semibold mb-2 tracking-tight">{output.summary.title}</h2>
        <p className="text-neutral-400 text-sm leading-relaxed">{output.summary.overview}</p>
        <div className="mt-3">
          <Tag>{output.summary.projectType}</Tag>
        </div>
      </section>

      <Divider />

      <section>
        <SectionLabel num="02">Requirements</SectionLabel>
        <ul className="space-y-3">
          {output.requirements.map((r, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className={`mt-0.5 font-mono text-[10px] font-bold shrink-0 ${PRIORITY_STYLE[r.priority]}`}>
                [{PRIORITY_LABEL[r.priority]}]
              </span>
              <span>
                <span className="font-medium text-neutral-200">{r.category}</span>
                <span className="text-neutral-500 mx-1.5">/</span>
                <span className="text-neutral-400">{r.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {output.missingInfo.length > 0 && (
        <>
          <Divider />
          <section>
            <SectionLabel num="03">Missing Information</SectionLabel>
            <ul className="space-y-2">
              {output.missingInfo.map((m, i) => (
                <li key={i} className="text-sm flex items-start gap-3">
                  <span className={`shrink-0 px-2 py-0.5 border text-[10px] font-mono font-bold ${IMPACT_STYLE[m.impact]}`}>
                    {m.impact === "blocking" ? "BLOCK" : m.impact === "important" ? "WARN" : "INFO"}
                  </span>
                  <span>
                    <span className="font-medium text-neutral-200">{m.field}</span>
                    <span className="text-neutral-500 mx-1.5">/</span>
                    <span className="text-neutral-400">{m.reason}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <Divider />

      <section>
        <SectionLabel num="04">Risks</SectionLabel>
        <ul className="space-y-2">
          {output.risks.map((r, i) => (
            <li key={i} className="text-sm flex items-start gap-3">
              <span className={`shrink-0 px-2 py-0.5 border text-[10px] font-mono font-bold ${SEVERITY_STYLE[r.severity]}`}>
                {r.severity === "high" ? "HIGH" : r.severity === "medium" ? "MED" : "LOW"}
              </span>
              <span>
                <span className="font-medium text-neutral-200">{r.type}</span>
                <span className="text-neutral-500 mx-1.5">/</span>
                <span className="text-neutral-400">{r.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Divider />

      <section>
        <SectionLabel num="05">Next Steps</SectionLabel>
        <ol className="space-y-3">
          {output.nextSteps.map((s) => (
            <li key={s.order} className="text-sm flex gap-4">
              <span className="shrink-0 w-6 h-6 border border-neutral-700 text-neutral-400 text-[10px] font-mono flex items-center justify-center">
                {String(s.order).padStart(2, "0")}
              </span>
              <span>
                <span className="text-neutral-200">{s.action}</span>
                <span className="text-neutral-600 ml-2 text-xs">— {s.owner}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {output.proposalAngles.length > 0 && (
        <>
          <Divider />
          <section>
            <SectionLabel num="06">Proposal Angles</SectionLabel>
            <div className="space-y-4">
              {output.proposalAngles.map((a, i) => (
                <div key={i} className="text-sm border-l border-neutral-700 pl-4">
                  <p className="font-medium text-neutral-200">{a.angle}</p>
                  <p className="text-neutral-500 mt-1 text-xs leading-relaxed">{a.reasoning}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="pt-6 border-t border-neutral-800 flex gap-3">
        <button onClick={handleCopy} className="px-5 py-2 text-xs border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors tracking-wide uppercase">
          Copy
        </button>
        <button onClick={handleDownload} className="px-5 py-2 text-xs border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors tracking-wide uppercase">
          Download
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

function SectionLabel({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-3 text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4">
      <span className="text-neutral-700">{num}</span>
      {children}
    </h3>
  );
}

function Divider() {
  return <div className="h-px bg-neutral-800/50" />;
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-3 py-1 border border-neutral-700 text-neutral-400 text-[10px] font-mono tracking-wide uppercase">{children}</span>;
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
    <div className="border-t border-dashed border-neutral-800 pt-4">
      <button onClick={() => setOpen(!open)} className="text-[10px] text-neutral-600 hover:text-neutral-400 flex items-center gap-2 font-mono tracking-wide">
        <span>{open ? "▾" : "▸"}</span>
        <span>
          DEBUG — rules {hitCount}/{totalRules}{removedCount > 0 ? ` / filtered ${removedCount}` : ""}{demoSafeMode ? " / SafeMode ON" : ""}
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-4">
          {facts && (
            <div>
              <div className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider mb-1">Facts</div>
              <div className="text-[11px] bg-neutral-900 border border-neutral-800 px-3 py-2 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-neutral-400">
                <span>visualIdentity: <b className="text-neutral-200">{facts.visualIdentityStatus}</b></span>
                <span>budget: <b className="text-neutral-200">{facts.budgetStatus}</b></span>
                <span>timeline: <b className="text-neutral-200">{facts.timelineStatus}</b></span>
                <span>customerGroup: <b className="text-neutral-200">{facts.customerGroupKnown ? "yes" : "no"}</b></span>
                <span>area: <b className="text-neutral-200">{facts.areaKnown ? facts.areaValue : "unknown"}</b></span>
                <span>scene: <b className="text-neutral-200">{facts.projectScene || "-"}</b></span>
                <span>regions: <b className="text-neutral-200">{facts.regionNormalized.length > 0 ? facts.regionNormalized.join(", ") : "none"}</b></span>
                <span>months: <b className="text-neutral-200">{facts.monthDetected.length > 0 ? facts.monthDetected.map((m) => `${m}月`).join(", ") : "none"}</b></span>
              </div>
            </div>
          )}

          {filteredItems && filteredItems.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider mb-1">Filtered</div>
              <div className="space-y-1">
                {filteredItems.map((f, i) => (
                  <div key={i} className={`text-[11px] font-mono px-3 py-1.5 border ${f.action === "removed" ? "bg-red-950/30 border-red-900/30 text-red-400" : "bg-amber-950/30 border-amber-900/30 text-amber-400"}`}>
                    <span className="font-bold">
                      {f.action === "removed" ? "DEL" : "RWD"}
                    </span>{" "}
                    <span className="text-neutral-500">[{f.type}]</span>{" "}
                    <span className="text-neutral-300">{f.original}</span>
                    <span className="text-neutral-600"> — {f.reason}</span>
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
  for (const r of o.requirements) lines.push(`[${r.priority}] ${r.category}：${r.description}`);
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

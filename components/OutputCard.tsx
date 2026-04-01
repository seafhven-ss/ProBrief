"use client";

import type { BriefOutput, FactsSnapshotDebug, FilteredItemDebug, RuleDebugEntry } from "@/lib/types";
import { useState } from "react";

const SEVERITY_COLOR: Record<string, React.CSSProperties> = {
  high: { color: "#ef4444", background: "rgba(239, 68, 68, 0.1)" },
  medium: { color: "#eab308", background: "rgba(234, 179, 8, 0.1)" },
  low: { color: "#22c55e", background: "rgba(34, 197, 94, 0.1)" },
};

const IMPACT_COLOR: Record<string, React.CSSProperties> = {
  blocking: { color: "#ef4444", background: "rgba(239, 68, 68, 0.1)" },
  important: { color: "#eab308", background: "rgba(234, 179, 8, 0.1)" },
  optional: { color: "var(--text-tertiary)", background: "var(--bg-elevated)" },
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "#ef4444",
  medium: "#eab308",
  low: "var(--text-tertiary)",
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
    <div
      className="rounded-lg p-6 space-y-6 min-h-[500px]"
      style={{
        border: "1px solid var(--border-default)",
        background: "var(--bg-panel)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <section>
        <SectionLabel num="01">项目概述 Project Overview</SectionLabel>
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{output.summary.title}</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{output.summary.overview}</p>
        <div className="mt-2">
          <Tag>{output.summary.projectType}</Tag>
        </div>
      </section>

      <Divider />

      <section>
        <SectionLabel num="02">需求拆解 Requirements</SectionLabel>
        <ul className="space-y-3">
          {output.requirements.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 font-semibold shrink-0 font-mono text-[10px]" style={{ color: PRIORITY_COLOR[r.priority] }}>
                [{PRIORITY_LABEL[r.priority]}]
              </span>
              <span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{r.category}</span>
                <span style={{ color: "var(--text-tertiary)" }}> / </span>
                <span style={{ color: "var(--text-secondary)" }}>{r.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {output.missingInfo.length > 0 && (
        <>
          <Divider />
          <section>
            <SectionLabel num="03">缺失信息 Missing Information</SectionLabel>
            <ul className="space-y-2">
              {output.missingInfo.map((m, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span
                    className="shrink-0 px-1.5 py-0.5 rounded text-xs font-medium font-mono"
                    style={IMPACT_COLOR[m.impact]}
                  >
                    {m.impact === "blocking" ? "BLOCK" : m.impact === "important" ? "WARN" : "INFO"}
                  </span>
                  <span>
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{m.field}</span>
                    <span style={{ color: "var(--text-tertiary)" }}> / </span>
                    <span style={{ color: "var(--text-secondary)" }}>{m.reason}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <Divider />

      <section>
        <SectionLabel num="04">风险与难点 Risks</SectionLabel>
        <ul className="space-y-2">
          {output.risks.map((r, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span
                className="shrink-0 px-1.5 py-0.5 rounded text-xs font-medium font-mono"
                style={SEVERITY_COLOR[r.severity]}
              >
                {r.severity === "high" ? "HIGH" : r.severity === "medium" ? "MED" : "LOW"}
              </span>
              <span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{r.type}</span>
                <span style={{ color: "var(--text-tertiary)" }}> / </span>
                <span style={{ color: "var(--text-secondary)" }}>{r.description}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Divider />

      <section>
        <SectionLabel num="05">下一步建议 Next Steps</SectionLabel>
        <ol className="space-y-3">
          {output.nextSteps.map((s) => (
            <li key={s.order} className="text-sm flex gap-3">
              <span
                className="shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium"
                style={{ background: "var(--accent-indigo)", color: "#ffffff" }}
              >
                {s.order}
              </span>
              <span>
                <span style={{ color: "var(--text-primary)" }}>{s.action}</span>
                <span className="ml-2" style={{ color: "var(--text-tertiary)" }}>— {s.owner}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {output.proposalAngles.length > 0 && (
        <>
          <Divider />
          <section>
            <SectionLabel num="06">提案切入建议 Proposal Angles</SectionLabel>
            <div className="space-y-3">
              {output.proposalAngles.map((a, i) => (
                <div
                  key={i}
                  className="text-sm pl-3"
                  style={{ borderLeft: "2px solid var(--border-default)" }}
                >
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{a.angle}</p>
                  <p className="mt-0.5" style={{ color: "var(--text-tertiary)" }}>{a.reasoning}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="pt-4 flex gap-3" style={{ borderTop: "1px solid var(--border-default)" }}>
        <button
          onClick={handleCopy}
          className="px-4 py-2 text-sm rounded-lg transition-colors duration-200"
          style={{
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
            background: "transparent",
          }}
        >
          复制 <span className="text-[9px] ml-1 tracking-widest uppercase opacity-60">COPY</span>
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 text-sm rounded-lg transition-colors duration-200"
          style={{
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
            background: "transparent",
          }}
        >
          下载 <span className="text-[9px] ml-1 tracking-widest uppercase opacity-60">DOWNLOAD</span>
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
    <h3 className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent-indigo)" }}>
      <span style={{ color: "var(--text-tertiary)" }}>{num}</span>
      {children}
    </h3>
  );
}

function Divider() {
  return <div className="h-px" style={{ background: "var(--border-default)", opacity: 0.5 }} />;
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-2 py-0.5 text-xs rounded"
      style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
    >
      {children}
    </span>
  );
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
    <div className="pt-4" style={{ borderTop: "1px dashed var(--border-default)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs flex items-center gap-1 transition-colors duration-200 font-mono"
        style={{ color: "var(--text-tertiary)" }}
      >
        <span>{open ? "\u25BE" : "\u25B8"}</span>
        <span>
          DEBUG — rules {hitCount}/{totalRules}{removedCount > 0 ? ` / filtered ${removedCount}` : ""}{demoSafeMode ? " / SafeMode ON" : ""}
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-4">
          {facts && (
            <div>
              <div
                className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                Extracted Facts
              </div>
              <div
                className="text-xs rounded px-3 py-2 grid grid-cols-2 gap-x-4 gap-y-1"
                style={{
                  background: "rgba(123, 127, 255, 0.08)",
                  border: "1px solid rgba(123, 127, 255, 0.2)",
                  color: "var(--text-secondary)",
                }}
              >
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
              <div
                className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                Filtered Items
              </div>
              <div className="space-y-1">
                {filteredItems.map((f, i) => (
                  <div
                    key={i}
                    className="text-xs rounded px-3 py-1.5"
                    style={{
                      background: f.action === "removed" ? "rgba(239, 68, 68, 0.08)" : "rgba(234, 179, 8, 0.08)",
                      border: `1px solid ${f.action === "removed" ? "rgba(239, 68, 68, 0.2)" : "rgba(234, 179, 8, 0.2)"}`,
                    }}
                  >
                    <span
                      className="font-mono font-semibold"
                      style={{ color: f.action === "removed" ? "#ef4444" : "#eab308" }}
                    >
                      {f.action === "removed" ? "DEL" : "RWD"}
                    </span>{" "}
                    <span style={{ color: "var(--text-tertiary)" }}>[{f.type}]</span>{" "}
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{f.original}</span>
                    <span style={{ color: "var(--text-tertiary)" }}> — {f.reason}</span>
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

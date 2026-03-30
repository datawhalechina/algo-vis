import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateTopKSteps, TopKState } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const PROBLEM_ID = 10012;

interface TopKInput extends ProblemInput {
  vocab: string;
  logits: string;
  k: number;
  temperature: number;
  seed: number;
}

const DEFAULT_VOCAB = "I,am,the,a,cat,dog,sat,on";
const DEFAULT_LOGITS = "2.1,0.5,1.8,0.9,3.2,1.1,0.3,0.7";
const DEFAULT_K = 4;
const DEFAULT_TEMP = 1.0;
const DEFAULT_SEED = 42;

function parseCSV(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseFloatCSV(raw: string): number[] {
  return raw
    .split(",")
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));
}

// ── 颜色工具 ──────────────────────────────────────────────────────

function getHeatColor(value: number, maxVal: number, minVal = 0): string {
  const ratio = maxVal > minVal ? Math.min((value - minVal) / (maxVal - minVal), 1) : 0;
  const hue = 220 - ratio * 200;
  return `hsl(${hue}, 75%, ${88 - ratio * 28}%)`;
}

function getTextColor(value: number, maxVal: number, minVal = 0): string {
  const ratio = maxVal > minVal ? (value - minVal) / (maxVal - minVal) : 0;
  return ratio > 0.6 ? "#fff" : "#1e293b";
}

// ── 阶段元数据 ────────────────────────────────────────────────────

const PHASE_META: Record<string, { label: string; color: string }> = {
  init:        { label: "初始化",        color: "gray"    },
  temperature: { label: "① 温度缩放",    color: "violet"  },
  softmax:     { label: "② 全分布Softmax", color: "blue"  },
  topk:        { label: "③ 取 Top-k",    color: "amber"   },
  renormalize: { label: "④ 重归一化",    color: "orange"  },
  sample:      { label: "⑤ 采样",        color: "emerald" },
  complete:    { label: "完成",          color: "emerald" },
};

const PHASE_ORDER = ["init", "temperature", "softmax", "topk", "renormalize", "sample", "complete"];

function phaseIdx(p: string): number {
  return PHASE_ORDER.indexOf(p);
}

// ── 子组件 ────────────────────────────────────────────────────────

/** 单个 token 的卡片，用于概率分布展示 */
function TokenCard({
  token,
  prob,
  maxProb,
  isTopK,
  isSampled,
  showBar = true,
  label,
}: {
  token: string;
  prob: number;
  maxProb: number;
  isTopK: boolean;
  isSampled: boolean;
  showBar?: boolean;
  label?: string;
}) {
  const bg = isTopK ? getHeatColor(prob, maxProb) : "#f1f5f9";
  const tc = isTopK ? getTextColor(prob, maxProb) : "#94a3b8";

  return (
    <div
      className={`rounded-lg border px-2.5 py-2 transition-all duration-200 ${
        isSampled
          ? "ring-2 ring-emerald-500 border-emerald-400 shadow-md scale-105"
          : isTopK
          ? "border-gray-200 shadow-sm"
          : "border-dashed border-gray-200 opacity-50"
      }`}
      style={{ backgroundColor: bg, color: tc }}
    >
      {label && (
        <div
          className="text-[9px] font-semibold mb-0.5 opacity-70"
          style={{ color: tc }}
        >
          {label}
        </div>
      )}
      <div className="text-xs font-mono font-bold truncate">{token}</div>
      <div className="text-[10px] font-mono mt-0.5">{prob > 0 ? prob.toFixed(4) : "—"}</div>
      {showBar && prob > 0 && (
        <div className="mt-1 h-0.5 rounded-full bg-black/10 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min((prob / maxProb) * 100, 100)}%`,
              backgroundColor: tc === "#fff" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.25)",
            }}
          />
        </div>
      )}
    </div>
  );
}

/** 管道步骤 */
function Step({
  num,
  label,
  active,
  done,
  children,
}: {
  num: string;
  label: string;
  active: boolean;
  done: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 transition-all duration-200 ${
        active
          ? "border-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-200"
          : done
          ? "border-emerald-200 bg-emerald-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
            active
              ? "bg-blue-500 text-white"
              : done
              ? "bg-emerald-500 text-white"
              : "bg-gray-100 text-gray-400 border border-gray-300"
          }`}
        >
          {done && !active ? "✓" : num}
        </span>
        <span
          className={`text-xs font-semibold ${
            active ? "text-blue-700" : done ? "text-emerald-700" : "text-gray-400"
          }`}
        >
          {label}
        </span>
      </div>
      {children && <div className="ml-7">{children}</div>}
    </div>
  );
}

function Arrow({ active }: { active: boolean }) {
  return (
    <div className={`text-center text-lg leading-none ${active ? "text-blue-400" : "text-gray-200"}`}>
      ↓
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────

function TopKSamplingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<TopKInput, Record<string, never>>
      config={{
        defaultInput: {
          vocab: DEFAULT_VOCAB,
          logits: DEFAULT_LOGITS,
          k: DEFAULT_K,
          temperature: DEFAULT_TEMP,
          seed: DEFAULT_SEED,
        },

        algorithm: (input) => {
          const vocab = parseCSV(
            typeof input.vocab === "string" ? input.vocab : DEFAULT_VOCAB
          );
          const logits = parseFloatCSV(
            typeof input.logits === "string" ? input.logits : DEFAULT_LOGITS
          );
          const k =
            typeof input.k === "number"
              ? Math.max(1, Math.min(Math.floor(input.k), vocab.length || 8))
              : DEFAULT_K;
          const temperature =
            typeof input.temperature === "number"
              ? Math.max(input.temperature, 0.01)
              : DEFAULT_TEMP;
          const seed =
            typeof input.seed === "number" ? input.seed : DEFAULT_SEED;
          return generateTopKSteps(vocab, logits, k, temperature, seed);
        },

        inputTypes: [
          { type: "string", key: "vocab",       label: "词表（逗号分隔）" },
          { type: "string", key: "logits",      label: "Logits（逗号分隔）" },
          { type: "number", key: "k",           label: "k 值" },
          { type: "number", key: "temperature", label: "温度 T" },
          { type: "number", key: "seed",        label: "随机种子" },
        ],
        inputFields: [
          { type: "string", key: "vocab",       label: "词表（逗号分隔）",     placeholder: DEFAULT_VOCAB },
          { type: "string", key: "logits",      label: "Logits（逗号分隔）",   placeholder: DEFAULT_LOGITS },
          { type: "number", key: "k",           label: "k 值",                 placeholder: String(DEFAULT_K) },
          { type: "number", key: "temperature", label: "温度 T",               placeholder: String(DEFAULT_TEMP) },
          { type: "number", key: "seed",        label: "随机种子",             placeholder: String(DEFAULT_SEED) },
        ],

        testCases: [
          {
            label: "示例（k=4）",
            value: { vocab: DEFAULT_VOCAB, logits: DEFAULT_LOGITS, k: DEFAULT_K, temperature: DEFAULT_TEMP, seed: DEFAULT_SEED },
          },
          {
            label: "保守（k=2）",
            value: { vocab: "hello,world,the,a,cat,dog,sat,on", logits: "3.5,2.0,1.5,0.8,4.2,0.5,0.2,0.9", k: 2, temperature: 0.7, seed: 7 },
          },
          {
            label: "多样（k=6，高温）",
            value: { vocab: "A,B,C,D,E,F,G,H", logits: "2.0,1.8,1.5,1.2,0.9,0.6,0.3,0.1", k: 6, temperature: 1.5, seed: 99 },
          },
        ],

        render: ({ variables }) => {
          const state = variables as unknown as TopKState | undefined;
          const phase        = state?.phase ?? "init";
          const vocab        = state?.vocab ?? [];
          const logits       = state?.logits ?? [];
          const scaledLogits = state?.scaledLogits ?? [];
          const fullProbs    = state?.fullProbs ?? [];
          const topKIndices  = state?.topKIndices ?? [];
          const topKProbs    = state?.topKProbs ?? [];
          const k            = state?.k ?? DEFAULT_K;
          const temperature  = state?.temperature ?? DEFAULT_TEMP;
          const sampledIdx   = state?.sampledIdx ?? -1;
          const sampledToken = state?.sampledToken ?? "";
          const sampledProb  = state?.sampledProb ?? 0;
          const finished     = state?.finished ?? false;

          const curPhaseIdx = phaseIdx(phase);

          const isActive = (p: string) => phase === p;
          const isDone   = (p: string) => !isActive(p) && curPhaseIdx > phaseIdx(p);
          const isArrow  = (from: string, to: string) =>
            phase === to || (isDone(from) && !isDone(to) && !isActive(from));

          // 当前展示哪组概率（取最新可用的）
          const displayProbs: number[] =
            ["renormalize", "sample", "complete"].includes(phase) && topKProbs.length > 0
              ? topKProbs
              : fullProbs.length > 0
              ? fullProbs
              : [];

          const maxDisplayProb = displayProbs.length > 0 ? Math.max(...displayProbs) : 1;
          const maxFullProb    = fullProbs.length > 0 ? Math.max(...fullProbs) : 1;

          return (
            <div className="space-y-4">
              {/* 核心思想 */}
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题 + 公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Top-k 采样（Top-k Sampling）
                    </h3>
                    <div className="text-xs text-gray-500 mt-1 font-mono">
                      <InlineMath math={`\\tilde{p}(x_i) = \\frac{p(x_i) \\cdot \\mathbf{1}[x_i \\in V_k]}{\\sum_{j \\in V_k} p(x_j)}`} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      <InlineMath math={`V_k`} /> 为概率最高的 k 个 token 的集合
                    </p>
                  </div>

                  {phase !== "init" && (
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-700`}>
                        {PHASE_META[phase]?.label ?? phase}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        词表 {vocab.length} 个 → 保留 top-{k}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ═══ 流程管道 ═══ */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">Top-k 采样管道</h4>

                <div className="space-y-1">

                  {/* ① 温度缩放 */}
                  <Step num="1" label={`温度缩放：logit / T（T = ${temperature}）`} active={isActive("temperature")} done={isDone("temperature")}>
                    {isActive("temperature") && scaledLogits.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] text-violet-600 bg-violet-50 rounded p-2 border border-violet-100 mb-2">
                          <BlockMath math={`z'_i = \\frac{z_i}{T} = \\frac{z_i}{${temperature}}`} />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {vocab.slice(0, 6).map((tok, i) => (
                            <div key={i} className="text-[11px] bg-violet-50 border border-violet-200 rounded px-2 py-1 font-mono text-violet-700">
                              <span className="font-bold">{tok}</span>:{" "}
                              {(logits[i] ?? 0).toFixed(2)} → {(scaledLogits[i] ?? 0).toFixed(2)}
                            </div>
                          ))}
                          {vocab.length > 6 && (
                            <span className="text-[11px] text-gray-400 self-center">+{vocab.length - 6} 个</span>
                          )}
                        </div>
                      </div>
                    )}
                  </Step>

                  <Arrow active={isArrow("temperature", "softmax")} />

                  {/* ② 全分布 Softmax */}
                  <Step num="2" label="全分布 Softmax（所有 token 均有概率）" active={isActive("softmax")} done={isDone("softmax")}>
                    {isActive("softmax") && fullProbs.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] text-blue-600 bg-blue-50 rounded p-2 border border-blue-100 mb-2">
                          <InlineMath math={`p_i = \\text{softmax}(z'_i)`} />
                          <span className="ml-2 text-gray-500">所有 token 均可被选中（含低概率候选）</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                          {vocab.map((tok, i) => (
                            <TokenCard
                              key={i}
                              token={tok}
                              prob={fullProbs[i] ?? 0}
                              maxProb={maxFullProb}
                              isTopK={true}
                              isSampled={false}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </Step>

                  <Arrow active={isArrow("softmax", "topk")} />

                  {/* ③ 取 Top-k */}
                  <Step num="3" label={`取 Top-${k}：保留最高概率的 ${k} 个，其余截断`} active={isActive("topk")} done={isDone("topk")}>
                    {isActive("topk") && fullProbs.length > 0 && (
                      <div className="mt-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                          {vocab.map((tok, i) => {
                            const inTopK = topKIndices.includes(i);
                            return (
                              <TokenCard
                                key={i}
                                token={tok}
                                prob={inTopK ? (fullProbs[i] ?? 0) : 0}
                                maxProb={maxFullProb}
                                isTopK={inTopK}
                                isSampled={false}
                                label={inTopK ? `#${topKIndices.indexOf(i) + 1}` : "截断"}
                              />
                            );
                          })}
                        </div>
                        <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                          保留 {topKIndices.length} 个候选，截断 {vocab.length - topKIndices.length} 个低概率 token
                        </div>
                      </div>
                    )}
                  </Step>

                  <Arrow active={isArrow("topk", "renormalize")} />

                  {/* ④ 重归一化 */}
                  <Step num="4" label="重归一化：Top-k 候选概率之和缩放至 1" active={isActive("renormalize")} done={isDone("renormalize")}>
                    {isActive("renormalize") && topKProbs.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] text-orange-600 bg-orange-50 rounded p-2 border border-orange-100 mb-2">
                          <InlineMath math={`\\tilde{p}_i = \\frac{p_i}{\\sum_{j \\in V_k} p_j}`} />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                          {vocab.map((tok, i) => {
                            const inTopK = topKIndices.includes(i);
                            return (
                              <TokenCard
                                key={i}
                                token={tok}
                                prob={topKProbs[i] ?? 0}
                                maxProb={maxDisplayProb}
                                isTopK={inTopK}
                                isSampled={false}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Step>

                  <Arrow active={isArrow("renormalize", "sample")} />

                  {/* ⑤ 采样 */}
                  <Step num="5" label="按重归一化概率采样" active={isActive("sample") || isActive("complete")} done={false}>
                    {["sample", "complete"].includes(phase) && sampledToken && (
                      <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                          {vocab.map((tok, i) => {
                            const inTopK = topKIndices.includes(i);
                            return (
                              <TokenCard
                                key={i}
                                token={tok}
                                prob={topKProbs[i] ?? 0}
                                maxProb={maxDisplayProb}
                                isTopK={inTopK}
                                isSampled={i === sampledIdx}
                              />
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                          <span className="text-xs text-emerald-700">采样结果：</span>
                          <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm font-mono font-bold shadow">
                            {sampledToken}
                          </span>
                          <span className="text-xs text-emerald-600">
                            p = {sampledProb.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    )}
                  </Step>
                </div>
              </div>

              {/* ═══ 对比视图：全分布 vs Top-k 分布 ═══ */}
              {["renormalize", "sample", "complete"].includes(phase) && fullProbs.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    概率分布对比：全分布 vs Top-{k} 重归一化
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* 全分布 */}
                    <div>
                      <div className="text-xs text-gray-500 font-semibold mb-2 text-center">全分布 Softmax</div>
                      <div className="space-y-1">
                        {vocab.map((tok, i) => {
                          const p = fullProbs[i] ?? 0;
                          return (
                            <div key={i} className="flex items-center gap-1 text-[11px]">
                              <span className="w-10 font-mono text-right text-gray-500 shrink-0">{tok}</span>
                              <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden">
                                <div
                                  className="h-full rounded-sm"
                                  style={{
                                    width: `${Math.min((p / maxFullProb) * 100, 100)}%`,
                                    backgroundColor: getHeatColor(p, maxFullProb),
                                  }}
                                />
                              </div>
                              <span className="w-12 text-right text-gray-500">{p.toFixed(4)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Top-k 重归一化 */}
                    <div>
                      <div className="text-xs text-gray-500 font-semibold mb-2 text-center">
                        Top-{k} 重归一化
                      </div>
                      <div className="space-y-1">
                        {vocab.map((tok, i) => {
                          const inTopK = topKIndices.includes(i);
                          const p = topKProbs[i] ?? 0;
                          return (
                            <div key={i} className="flex items-center gap-1 text-[11px]">
                              <span className={`w-10 font-mono text-right shrink-0 ${inTopK ? "text-gray-800 font-semibold" : "text-gray-300"}`}>
                                {tok}
                              </span>
                              <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden">
                                {inTopK && (
                                  <div
                                    className={`h-full rounded-sm ${i === sampledIdx && ["sample", "complete"].includes(phase) ? "ring-1 ring-emerald-500" : ""}`}
                                    style={{
                                      width: `${Math.min((p / maxDisplayProb) * 100, 100)}%`,
                                      backgroundColor: i === sampledIdx && ["sample", "complete"].includes(phase)
                                        ? "#10b981"
                                        : getHeatColor(p, maxDisplayProb),
                                    }}
                                  />
                                )}
                              </div>
                              <span className={`w-12 text-right ${inTopK ? "text-gray-700" : "text-gray-300"}`}>
                                {inTopK ? p.toFixed(4) : "—"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ 完成结果 ═══ */}
              {finished && phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">采样完成 ✓</h4>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-emerald-600 font-semibold text-base">{vocab.length}</div>
                      <div className="text-gray-500">词表大小</div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-amber-600 font-semibold text-base">{k}</div>
                      <div className="text-gray-500">Top-k 候选</div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-emerald-700 font-mono font-bold text-base">{sampledToken}</div>
                      <div className="text-gray-500">采样结果</div>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-700 mt-3">
                    Top-k 将候选从 {vocab.length} 个压缩到 {k} 个（减少{" "}
                    {((1 - k / vocab.length) * 100).toFixed(0)}%），有效防止低质量 token 被采到，
                    同时重归一化保证 {k} 个候选的概率之和为 1。
                  </p>
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default TopKSamplingVisualizer;

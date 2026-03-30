import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateTopPSteps, TopPState } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const PROBLEM_ID = 10013;

interface TopPInput extends ProblemInput {
  vocab: string;
  logits: string;
  p: number;
  temperature: number;
  seed: number;
}

const DEFAULT_VOCAB = "I,am,the,a,cat,dog,sat,on";
const DEFAULT_LOGITS = "2.1,0.5,1.8,0.9,3.2,1.1,0.3,0.7";
const DEFAULT_P = 0.9;
const DEFAULT_TEMP = 1.0;
const DEFAULT_SEED = 42;

function parseCSV(raw: string): string[] {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseFloatCSV(raw: string): number[] {
  return raw.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
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
  init:        { label: "初始化",         color: "gray"    },
  temperature: { label: "① 温度缩放",     color: "violet"  },
  softmax:     { label: "② 全分布Softmax", color: "blue"   },
  sort:        { label: "③ 降序排列",     color: "indigo"  },
  nucleus:     { label: "④ 确定核集合",   color: "amber"   },
  renormalize: { label: "⑤ 重归一化",     color: "orange"  },
  sample:      { label: "⑥ 采样",         color: "emerald" },
  complete:    { label: "完成",           color: "emerald" },
};

const PHASE_ORDER = ["init", "temperature", "softmax", "sort", "nucleus", "renormalize", "sample", "complete"];

function phaseIdx(p: string): number {
  return PHASE_ORDER.indexOf(p);
}

// ── 子组件 ────────────────────────────────────────────────────────

function TokenCard({
  token,
  prob,
  maxProb,
  inNucleus,
  isSampled,
  rank,
  cumProb,
  label,
}: {
  token: string;
  prob: number;
  maxProb: number;
  inNucleus: boolean;
  isSampled: boolean;
  rank?: number;
  cumProb?: number;
  label?: string;
}) {
  const bg = inNucleus ? getHeatColor(prob, maxProb) : "#f1f5f9";
  const tc = inNucleus ? getTextColor(prob, maxProb) : "#94a3b8";

  return (
    <div
      className={`rounded-lg border px-2.5 py-2 transition-all duration-200 ${
        isSampled
          ? "ring-2 ring-emerald-500 border-emerald-400 shadow-md scale-105"
          : inNucleus
          ? "border-gray-200 shadow-sm"
          : "border-dashed border-gray-200 opacity-40"
      }`}
      style={{ backgroundColor: bg, color: tc }}
    >
      {label && (
        <div className="text-[9px] font-semibold mb-0.5 opacity-70" style={{ color: tc }}>
          {label}
        </div>
      )}
      <div className="text-xs font-mono font-bold truncate">{token}</div>
      <div className="text-[10px] font-mono mt-0.5">{prob > 0 ? prob.toFixed(4) : "—"}</div>
      {rank !== undefined && (
        <div className="text-[9px] opacity-60 mt-0.5">#{rank + 1}</div>
      )}
      {cumProb !== undefined && inNucleus && (
        <div className="text-[9px] mt-0.5" style={{ color: tc }}>
          累积: {cumProb.toFixed(3)}
        </div>
      )}
      {prob > 0 && (
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

// ── 累积概率条可视化 ──────────────────────────────────────────────

function CumulativeProbBar({
  sortedIndices,
  sortedProbs,
  cumulativeProbs,
  vocab,
  p,
  nucleusCount,
}: {
  sortedIndices: number[];
  sortedProbs: number[];
  cumulativeProbs: number[];
  vocab: string[];
  p: number;
  nucleusCount: number;
}) {
  if (sortedIndices.length === 0) return null;
  const total = cumulativeProbs[cumulativeProbs.length - 1] ?? 1;

  return (
    <div className="mt-2">
      <div className="text-[11px] text-amber-700 mb-1 font-semibold">
        累积概率条（p = {p}，核内 {nucleusCount} 个 token）
      </div>
      <div className="flex h-6 rounded-md overflow-hidden border border-gray-200 w-full">
        {sortedProbs.map((prob, rank) => {
          const inNucleus = rank < nucleusCount;
          const widthPct = (prob / total) * 100;
          return (
            <div
              key={rank}
              title={`${vocab[sortedIndices[rank]]}: ${prob.toFixed(4)}`}
              style={{
                width: `${widthPct}%`,
                backgroundColor: inNucleus
                  ? getHeatColor(prob, sortedProbs[0] ?? 1)
                  : "#e2e8f0",
                borderRight: rank < sortedProbs.length - 1 ? "1px solid rgba(255,255,255,0.4)" : "none",
              }}
              className="transition-all duration-200"
            />
          );
        })}
      </div>
      {/* p 阈值线 */}
      <div className="relative h-4 w-full mt-0.5">
        <div
          className="absolute top-0 h-3 border-l-2 border-red-400"
          style={{ left: `${Math.min(p * 100, 100)}%` }}
        >
          <span className="text-[9px] text-red-500 absolute -top-0.5 left-1 whitespace-nowrap">
            p={p}
          </span>
        </div>
      </div>
      {/* token 标签（只显示核内前6个） */}
      <div className="flex flex-wrap gap-1 mt-1">
        {sortedIndices.slice(0, Math.min(nucleusCount, 8)).map((origIdx, rank) => (
          <span
            key={rank}
            className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-amber-100 text-amber-800 border border-amber-200"
          >
            #{rank + 1} {vocab[origIdx]} ({sortedProbs[rank]?.toFixed(3)})
          </span>
        ))}
        {nucleusCount > 8 && (
          <span className="text-[10px] text-gray-400 self-center">+{nucleusCount - 8} 个</span>
        )}
      </div>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────

function TopPSamplingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<TopPInput, Record<string, never>>
      config={{
        defaultInput: {
          vocab: DEFAULT_VOCAB,
          logits: DEFAULT_LOGITS,
          p: DEFAULT_P,
          temperature: DEFAULT_TEMP,
          seed: DEFAULT_SEED,
        },

        algorithm: (input) => {
          const vocab = parseCSV(typeof input.vocab === "string" ? input.vocab : DEFAULT_VOCAB);
          const logits = parseFloatCSV(typeof input.logits === "string" ? input.logits : DEFAULT_LOGITS);
          const p =
            typeof input.p === "number" ? Math.max(0.01, Math.min(input.p, 1.0)) : DEFAULT_P;
          const temperature =
            typeof input.temperature === "number" ? Math.max(input.temperature, 0.01) : DEFAULT_TEMP;
          const seed = typeof input.seed === "number" ? input.seed : DEFAULT_SEED;
          return generateTopPSteps(vocab, logits, p, temperature, seed);
        },

        inputTypes: [
          { type: "string", key: "vocab",       label: "词表（逗号分隔）" },
          { type: "string", key: "logits",      label: "Logits（逗号分隔）" },
          { type: "number", key: "p",           label: "p 值（0~1）" },
          { type: "number", key: "temperature", label: "温度 T" },
          { type: "number", key: "seed",        label: "随机种子" },
        ],

        inputFields: [
          { type: "string", key: "vocab",       label: "词表（逗号分隔）",    placeholder: DEFAULT_VOCAB },
          { type: "string", key: "logits",      label: "Logits（逗号分隔）",  placeholder: DEFAULT_LOGITS },
          { type: "number", key: "p",           label: "p 值（0~1）",          placeholder: String(DEFAULT_P) },
          { type: "number", key: "temperature", label: "温度 T",               placeholder: String(DEFAULT_TEMP) },
          { type: "number", key: "seed",        label: "随机种子",             placeholder: String(DEFAULT_SEED) },
        ],

        testCases: [
          {
            label: "示例（p=0.9）",
            value: { vocab: DEFAULT_VOCAB, logits: DEFAULT_LOGITS, p: DEFAULT_P, temperature: DEFAULT_TEMP, seed: DEFAULT_SEED },
          },
          {
            label: "集中分布（p=0.8）",
            value: { vocab: "cat,dog,bird,fish,ant,bee,fox,hen", logits: "5.0,3.0,1.0,0.5,0.2,0.1,0.05,0.02", p: 0.8, temperature: 1.0, seed: 7 },
          },
          {
            label: "均匀分布（p=0.95）",
            value: { vocab: "A,B,C,D,E,F,G,H", logits: "2.0,1.9,1.8,1.7,1.6,1.5,1.4,1.3", p: 0.95, temperature: 1.0, seed: 99 },
          },
        ],

        render: ({ variables }) => {
          const state = variables as unknown as TopPState | undefined;
          const phase           = state?.phase ?? "init";
          const vocab           = state?.vocab ?? [];
          const logits          = state?.logits ?? [];
          const scaledLogits    = state?.scaledLogits ?? [];
          const fullProbs       = state?.fullProbs ?? [];
          const sortedIndices   = state?.sortedIndices ?? [];
          const sortedProbs     = state?.sortedProbs ?? [];
          const cumulativeProbs = state?.cumulativeProbs ?? [];
          const nucleusIndices  = state?.nucleusIndices ?? [];
          const nucleusProbs    = state?.nucleusProbs ?? [];
          const p               = state?.p ?? DEFAULT_P;
          const temperature     = state?.temperature ?? DEFAULT_TEMP;
          const sampledIdx      = state?.sampledIdx ?? -1;
          const sampledToken    = state?.sampledToken ?? "";
          const sampledProb     = state?.sampledProb ?? 0;
          const finished        = state?.finished ?? false;

          const curPhaseIdx = phaseIdx(phase);
          const isActive = (ph: string) => phase === ph;
          const isDone   = (ph: string) => !isActive(ph) && curPhaseIdx > phaseIdx(ph);

          const nucleusCount = nucleusIndices.length;
          const maxFullProb  = fullProbs.length > 0 ? Math.max(...fullProbs) : 1;
          const maxNuclProb  = nucleusProbs.length > 0 ? Math.max(...nucleusProbs) : 1;

          // 展示用概率：renormalize 及以后用核概率，否则用全分布
          const displayProbs =
            ["renormalize", "sample", "complete"].includes(phase) && nucleusProbs.some((v) => v > 0)
              ? nucleusProbs
              : fullProbs;
          const maxDisplayProb = displayProbs.length > 0 ? Math.max(...displayProbs) : 1;

          return (
            <div className="space-y-4">
              {/* 核心思想 */}
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题 + 公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Top-p（Nucleus）采样
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math={`V_p = \\min\\left\\{V' \\subseteq V : \\sum_{x_i \\in V'} p(x_i) \\geq p\\right\\}`} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      <InlineMath math={`V_p`} /> 为累积概率达到阈值 <InlineMath math={`p`} /> 的最小 token 集合（核）
                    </p>
                  </div>

                  {phase !== "init" && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs px-3 py-1 rounded-full font-semibold bg-amber-100 text-amber-700">
                        {PHASE_META[phase]?.label ?? phase}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        词表 {vocab.length} 个 → 核 {nucleusCount > 0 ? nucleusCount : "?"} 个
                      </span>
                    </div>
                  )}
                </div>

                {/* Top-p vs Top-k 对比说明 */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <div className="font-semibold text-amber-700 mb-1">Top-p（本题）</div>
                    <div className="text-gray-600">候选数量<strong>动态变化</strong>：分布集中时少，分散时多</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2">
                    <div className="font-semibold text-gray-500 mb-1">Top-k（对比）</div>
                    <div className="text-gray-400">候选数量<strong>固定为 k</strong>：无论分布是否集中</div>
                  </div>
                </div>
              </div>

              {/* ═══ 流程管道 ═══ */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">Top-p 采样管道</h4>
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
                          {vocab.length > 6 && <span className="text-[11px] text-gray-400 self-center">+{vocab.length - 6} 个</span>}
                        </div>
                      </div>
                    )}
                  </Step>

                  <Arrow active={curPhaseIdx >= phaseIdx("softmax")} />

                  {/* ② 全分布 Softmax */}
                  <Step num="2" label="全分布 Softmax（所有 token 均有概率）" active={isActive("softmax")} done={isDone("softmax")}>
                    {isActive("softmax") && fullProbs.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] text-blue-600 bg-blue-50 rounded p-2 border border-blue-100 mb-2">
                          <InlineMath math={`p_i = \\text{softmax}(z'_i) = \\frac{e^{z'_i}}{\\sum_j e^{z'_j}}`} />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                          {vocab.map((tok, i) => (
                            <TokenCard
                              key={i}
                              token={tok}
                              prob={fullProbs[i] ?? 0}
                              maxProb={maxFullProb}
                              inNucleus={true}
                              isSampled={false}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </Step>

                  <Arrow active={curPhaseIdx >= phaseIdx("sort")} />

                  {/* ③ 降序排列 */}
                  <Step num="3" label="按概率降序排列" active={isActive("sort")} done={isDone("sort")}>
                    {isActive("sort") && sortedIndices.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] text-indigo-600 mb-2">从高概率到低概率排列所有 token：</div>
                        <div className="flex flex-wrap gap-1">
                          {sortedIndices.map((origIdx, rank) => (
                            <div key={rank} className="flex items-center gap-0.5 text-[11px] bg-indigo-50 border border-indigo-200 rounded px-2 py-1 font-mono text-indigo-700">
                              <span className="text-[9px] text-indigo-400 mr-0.5">#{rank + 1}</span>
                              <span className="font-bold">{vocab[origIdx]}</span>
                              <span className="text-indigo-400 ml-0.5">{(sortedProbs[rank] ?? 0).toFixed(3)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Step>

                  <Arrow active={curPhaseIdx >= phaseIdx("nucleus")} />

                  {/* ④ 确定核集合 */}
                  <Step num="4" label={`确定核集合（Nucleus）：累积概率 ≥ p = ${p}`} active={isActive("nucleus")} done={isDone("nucleus")}>
                    {isActive("nucleus") && nucleusIndices.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] text-amber-700 bg-amber-50 rounded p-2 border border-amber-100 mb-2">
                          <InlineMath math={`\\sum_{x_i \\in V_p} p(x_i) \\geq ${p}`} />
                          <span className="ml-2">从高到低累加，直到超过 p</span>
                        </div>
                        <CumulativeProbBar
                          sortedIndices={sortedIndices}
                          sortedProbs={sortedProbs}
                          cumulativeProbs={cumulativeProbs}
                          vocab={vocab}
                          p={p}
                          nucleusCount={nucleusCount}
                        />
                        {/* 逐行累积表 */}
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="text-gray-400 border-b border-gray-100">
                                <th className="text-left py-0.5 pr-2">排名</th>
                                <th className="text-left py-0.5 pr-2">Token</th>
                                <th className="text-right py-0.5 pr-2">概率</th>
                                <th className="text-right py-0.5">累积概率</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedIndices.map((origIdx, rank) => {
                                const inN = rank < nucleusCount;
                                const cumP = cumulativeProbs[rank];
                                return (
                                  <tr
                                    key={rank}
                                    className={`border-b border-gray-50 ${inN ? "bg-amber-50" : "opacity-40"}`}
                                  >
                                    <td className="py-0.5 pr-2 text-gray-400">#{rank + 1}</td>
                                    <td className="py-0.5 pr-2 font-mono font-bold text-gray-800">{vocab[origIdx]}</td>
                                    <td className="py-0.5 pr-2 text-right text-gray-600">{(sortedProbs[rank] ?? 0).toFixed(4)}</td>
                                    <td className={`py-0.5 text-right font-semibold ${cumP !== undefined && cumP >= p ? "text-amber-700" : "text-gray-500"}`}>
                                      {cumP !== undefined ? cumP.toFixed(4) : "—"}
                                      {cumP !== undefined && cumP >= p && rank < nucleusCount && (
                                        <span className="ml-1 text-[9px] text-amber-600">≥p ✓</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </Step>

                  <Arrow active={curPhaseIdx >= phaseIdx("renormalize")} />

                  {/* ⑤ 重归一化 */}
                  <Step num="5" label="重归一化：核内 token 概率缩放至和为 1" active={isActive("renormalize")} done={isDone("renormalize")}>
                    {isActive("renormalize") && nucleusProbs.some((v) => v > 0) && (
                      <div className="mt-2">
                        <div className="text-[11px] text-orange-600 bg-orange-50 rounded p-2 border border-orange-100 mb-2">
                          <InlineMath math={`\\tilde{p}(x_i) = \\frac{p(x_i)}{\\sum_{x_j \\in V_p} p(x_j)}`} />
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                          {vocab.map((tok, i) => (
                            <TokenCard
                              key={i}
                              token={tok}
                              prob={nucleusProbs[i] ?? 0}
                              maxProb={maxNuclProb}
                              inNucleus={nucleusIndices.includes(i)}
                              isSampled={false}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </Step>

                  <Arrow active={curPhaseIdx >= phaseIdx("sample")} />

                  {/* ⑥ 采样 */}
                  <Step num="6" label="按重归一化概率采样" active={isActive("sample") || isActive("complete")} done={false}>
                    {["sample", "complete"].includes(phase) && sampledToken && (
                      <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1">
                          {vocab.map((tok, i) => (
                            <TokenCard
                              key={i}
                              token={tok}
                              prob={nucleusProbs[i] ?? 0}
                              maxProb={maxDisplayProb}
                              inNucleus={nucleusIndices.includes(i)}
                              isSampled={i === sampledIdx}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                          <span className="text-xs text-emerald-700">采样结果：</span>
                          <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm font-mono font-bold shadow">
                            {sampledToken}
                          </span>
                          <span className="text-xs text-emerald-600">
                            p̃ = {sampledProb.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    )}
                  </Step>
                </div>
              </div>

              {/* ═══ 分布对比：全分布 vs 核分布 ═══ */}
              {["renormalize", "sample", "complete"].includes(phase) && fullProbs.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    概率分布对比：全分布 vs 核分布（重归一化）
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 font-semibold mb-2 text-center">全分布 Softmax</div>
                      <div className="space-y-1">
                        {vocab.map((tok, i) => {
                          const prob = fullProbs[i] ?? 0;
                          return (
                            <div key={i} className="flex items-center gap-1 text-[11px]">
                              <span className="w-10 font-mono text-right text-gray-500 shrink-0">{tok}</span>
                              <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden">
                                <div
                                  className="h-full rounded-sm"
                                  style={{
                                    width: `${Math.min((prob / maxFullProb) * 100, 100)}%`,
                                    backgroundColor: getHeatColor(prob, maxFullProb),
                                  }}
                                />
                              </div>
                              <span className="w-12 text-right text-gray-500">{prob.toFixed(4)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 font-semibold mb-2 text-center">
                        核分布（重归一化，p={p}）
                      </div>
                      <div className="space-y-1">
                        {vocab.map((tok, i) => {
                          const inN = nucleusIndices.includes(i);
                          const prob = nucleusProbs[i] ?? 0;
                          return (
                            <div key={i} className="flex items-center gap-1 text-[11px]">
                              <span className={`w-10 font-mono text-right shrink-0 ${inN ? "text-gray-800 font-semibold" : "text-gray-300"}`}>
                                {tok}
                              </span>
                              <div className="flex-1 h-4 bg-gray-100 rounded-sm overflow-hidden">
                                {inN && (
                                  <div
                                    className={`h-full rounded-sm ${i === sampledIdx && ["sample", "complete"].includes(phase) ? "ring-1 ring-emerald-500" : ""}`}
                                    style={{
                                      width: `${Math.min((prob / maxNuclProb) * 100, 100)}%`,
                                      backgroundColor:
                                        i === sampledIdx && ["sample", "complete"].includes(phase)
                                          ? "#10b981"
                                          : getHeatColor(prob, maxNuclProb),
                                    }}
                                  />
                                )}
                              </div>
                              <span className={`w-12 text-right ${inN ? "text-gray-700" : "text-gray-300"}`}>
                                {inN ? prob.toFixed(4) : "—"}
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
                      <div className="text-amber-600 font-semibold text-base">{nucleusCount}</div>
                      <div className="text-gray-500">核大小（动态）</div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-emerald-700 font-mono font-bold text-base">{sampledToken}</div>
                      <div className="text-gray-500">采样结果</div>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-700 mt-3">
                    Top-p（p={p}）动态选出 <strong>{nucleusCount}</strong> 个核 token（原词表 {vocab.length} 个），
                    相比 Top-k 固定 k 个，Top-p 能自适应概率分布的集中程度，分布集中时候选少，分散时候选多。
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

export default TopPSamplingVisualizer;

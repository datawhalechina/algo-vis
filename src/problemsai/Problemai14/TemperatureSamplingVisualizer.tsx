import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateTemperatureSamplingSteps, TemperatureState } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const PROBLEM_ID = 10014;

interface TemperatureInput extends ProblemInput {
  vocab: string;
  logits: string;
  temperature: number;
  seed: number;
}

const DEFAULT_VOCAB = "I,am,the,a,cat,dog,sat,on";
const DEFAULT_LOGITS = "2.1,0.5,1.8,0.9,3.2,1.1,0.3,0.7";
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


// ── 阶段元数据 ────────────────────────────────────────────────────

const PHASE_META: Record<string, { label: string; color: string }> = {
  init:        { label: "初始化",      color: "gray"    },
  temperature: { label: "① 温度缩放",  color: "violet"  },
  softmax:     { label: "② Softmax",   color: "blue"    },
  sample:      { label: "③ 采样",      color: "emerald" },
  complete:    { label: "完成",        color: "emerald" },
};

const PHASE_ORDER = ["init", "temperature", "softmax", "sample", "complete"];

function phaseIdx(p: string): number {
  return PHASE_ORDER.indexOf(p);
}

// ── 概率柱状图 ────────────────────────────────────────────────────

function ProbBar({
  label,
  vocab,
  probs,
  maxProb,
  sampledIdx,
  argmaxIdx,
  highlight,
}: {
  label: string;
  vocab: string[];
  probs: number[];
  maxProb: number;
  sampledIdx?: number;
  argmaxIdx?: number;
  highlight?: "sampled" | "argmax" | "both";
}) {
  if (probs.length === 0) return null;

  return (
    <div>
      <div className="text-[11px] font-semibold text-gray-600 mb-2">{label}</div>
      <div className="space-y-1">
        {vocab.map((tok, i) => {
          const prob = probs[i] ?? 0;
          const isArgmax = argmaxIdx === i;
          const isSampled = sampledIdx === i;
          const bg = getHeatColor(prob, maxProb);
          return (
            <div key={i} className="flex items-center gap-1.5 text-[11px]">
              <span
                className={`w-10 font-mono text-right shrink-0 font-semibold ${
                  isSampled
                    ? "text-emerald-700"
                    : isArgmax && (highlight === "argmax" || highlight === "both")
                    ? "text-violet-700"
                    : "text-gray-600"
                }`}
              >
                {tok}
              </span>
              <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden relative">
                <div
                  className="h-full rounded transition-all duration-300"
                  style={{
                    width: `${Math.min((prob / maxProb) * 100, 100)}%`,
                    backgroundColor:
                      isSampled && (highlight === "sampled" || highlight === "both")
                        ? "#10b981"
                        : bg,
                  }}
                />
                {isSampled && (highlight === "sampled" || highlight === "both") && (
                  <span className="absolute right-1 top-0 h-full flex items-center text-[10px] font-bold text-emerald-700">
                    ← 采样
                  </span>
                )}
              </div>
              <span
                className={`w-14 text-right font-mono text-[10px] ${
                  isSampled ? "text-emerald-700 font-bold" : "text-gray-500"
                }`}
              >
                {prob.toFixed(4)}
              </span>
              {isSampled && (
                <span className="text-emerald-500 text-[10px]">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 步骤卡片 ──────────────────────────────────────────────────────

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
    <div
      className={`text-center text-lg leading-none ${active ? "text-blue-400" : "text-gray-200"}`}
    >
      ↓
    </div>
  );
}

// ── 温度对比可视化 ─────────────────────────────────────────────────

function TemperatureGauge({ temperature }: { temperature: number }) {
  // T 范围 0.01 ~ 3，映射到 0~100%
  const clamp = Math.min(Math.max(temperature, 0.01), 3);
  const pct = ((clamp - 0.01) / (3 - 0.01)) * 100;

  let label = "中性（T≈1）";
  let labelColor = "text-blue-600";
  if (temperature < 0.7) { label = "低温（确定性↑）"; labelColor = "text-violet-700"; }
  else if (temperature > 1.4) { label = "高温（随机性↑）"; labelColor = "text-rose-600"; }

  return (
    <div className="mt-2">
      <div className={`text-[11px] font-semibold mb-1 ${labelColor}`}>
        T = {temperature} — {label}
      </div>
      <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-violet-400 via-blue-400 to-rose-400">
        <div
          className="absolute top-0 h-full w-0.5 bg-white shadow-md"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>确定 (0)</span>
        <span>T=1</span>
        <span>随机 (3+)</span>
      </div>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────

function TemperatureSamplingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<TemperatureInput, Record<string, never>>
      config={{
        defaultInput: {
          vocab: DEFAULT_VOCAB,
          logits: DEFAULT_LOGITS,
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
          const temperature =
            typeof input.temperature === "number"
              ? Math.max(input.temperature, 0.01)
              : DEFAULT_TEMP;
          const seed =
            typeof input.seed === "number" ? input.seed : DEFAULT_SEED;
          return generateTemperatureSamplingSteps(vocab, logits, temperature, seed);
        },

        inputTypes: [
          { type: "string", key: "vocab",       label: "词表（逗号分隔）" },
          { type: "string", key: "logits",      label: "Logits（逗号分隔）" },
          { type: "number", key: "temperature", label: "温度 T（> 0）" },
          { type: "number", key: "seed",        label: "随机种子" },
        ],

        inputFields: [
          { type: "string", key: "vocab",       label: "词表（逗号分隔）",   placeholder: DEFAULT_VOCAB },
          { type: "string", key: "logits",      label: "Logits（逗号分隔）", placeholder: DEFAULT_LOGITS },
          { type: "number", key: "temperature", label: "温度 T（> 0）",      placeholder: String(DEFAULT_TEMP) },
          { type: "number", key: "seed",        label: "随机种子",           placeholder: String(DEFAULT_SEED) },
        ],

        testCases: [
          {
            label: "默认（T=1.0）",
            value: { vocab: DEFAULT_VOCAB, logits: DEFAULT_LOGITS, temperature: 1.0, seed: DEFAULT_SEED },
          },
          {
            label: "低温（T=0.2）",
            value: { vocab: DEFAULT_VOCAB, logits: DEFAULT_LOGITS, temperature: 0.2, seed: DEFAULT_SEED },
          },
          {
            label: "高温（T=2.5）",
            value: { vocab: DEFAULT_VOCAB, logits: DEFAULT_LOGITS, temperature: 2.5, seed: DEFAULT_SEED },
          },
        ],

        render: ({ variables }) => {
          const state = variables as unknown as TemperatureState | undefined;
          const phase       = state?.phase ?? "init";
          const vocab       = state?.vocab ?? [];
          const logits      = state?.logits ?? [];
          const scaledLogits  = state?.scaledLogits ?? [];
          const baseProbs   = state?.baseProbs ?? [];
          const scaledProbs = state?.scaledProbs ?? [];
          const temperature = state?.temperature ?? DEFAULT_TEMP;
          const entropy     = state?.entropy ?? 0;
          const argmaxIdx   = state?.argmaxIdx ?? 0;
          const sampledIdx  = state?.sampledIdx ?? -1;
          const sampledToken = state?.sampledToken ?? "";
          const sampledProb = state?.sampledProb ?? 0;
          const randVal     = state?.randVal ?? 0;
          const finished    = state?.finished ?? false;

          const curPhaseIdx = phaseIdx(phase);
          const isActive = (ph: string) => phase === ph;
          const isDone = (ph: string) =>
            !isActive(ph) && curPhaseIdx > phaseIdx(ph);

          const maxBaseProb = baseProbs.length > 0 ? Math.max(...baseProbs) : 1;
          const maxScaledProb = scaledProbs.length > 0 ? Math.max(...scaledProbs) : 1;

          const phaseLabel = PHASE_META[phase]?.label ?? phase;
          const phaseColor = PHASE_META[phase]?.color ?? "gray";

          const colorClasses: Record<string, string> = {
            gray:    "bg-gray-100 text-gray-700",
            violet:  "bg-violet-100 text-violet-700",
            blue:    "bg-blue-100 text-blue-700",
            emerald: "bg-emerald-100 text-emerald-700",
          };

          return (
            <div className="space-y-4">
              {/* 核心思想 */}
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题 + 公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">温度采样</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math={`P_T(x_i) = \\frac{\\exp(z_i / T)}{\\sum_j \\exp(z_j / T)}`} />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      <InlineMath math={`T \\to 0`} /> 趋近 argmax；
                      <InlineMath math={`T \\to \\infty`} /> 趋近均匀分布
                    </p>
                  </div>

                  {phase !== "init" && (
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          colorClasses[phaseColor] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {phaseLabel}
                      </span>
                      {entropy > 0 && (
                        <span className="text-[11px] text-gray-400">
                          熵 H = {entropy.toFixed(4)} nats
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 温度计 */}
                <TemperatureGauge temperature={temperature} />

                {/* 温度对比说明 */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-violet-50 border border-violet-200 rounded p-2">
                    <div className="font-semibold text-violet-700 mb-1">低温（T &lt; 1）</div>
                    <div className="text-gray-600">分布更<strong>尖锐</strong>，高概率 token 被放大，生成更确定</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <div className="font-semibold text-blue-700 mb-1">中性（T = 1）</div>
                    <div className="text-gray-600">原始 Softmax 概率，不做额外调整</div>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded p-2">
                    <div className="font-semibold text-rose-700 mb-1">高温（T &gt; 1）</div>
                    <div className="text-gray-600">分布更<strong>平坦</strong>，趋向均匀，生成更随机</div>
                  </div>
                </div>
              </div>

              {/* ═══ 流程管道 ═══ */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">温度采样流程</h4>
                <div className="space-y-1">

                  {/* ① 温度缩放 */}
                  <Step
                    num="1"
                    label={`温度缩放：z'_i = z_i / T（T = ${temperature}）`}
                    active={isActive("temperature")}
                    done={isDone("temperature")}
                  >
                    {isActive("temperature") && scaledLogits.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] text-violet-600 bg-violet-50 rounded p-2 border border-violet-100 mb-2">
                          <BlockMath math={`z'_i = \\frac{z_i}{T} = \\frac{z_i}{${temperature}}`} />
                        </div>
                        <div className="overflow-x-auto">
                          <table className="text-[11px] w-full">
                            <thead>
                              <tr className="text-gray-400 border-b border-gray-100">
                                <th className="text-left py-0.5 pr-3 font-normal">Token</th>
                                <th className="text-right py-0.5 pr-3 font-normal">
                                  原始 <InlineMath math="z_i" />
                                </th>
                                <th className="text-right py-0.5 font-normal">
                                  缩放后 <InlineMath math="z'_i" />
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {vocab.map((tok, i) => (
                                <tr
                                  key={i}
                                  className="border-b border-gray-50 hover:bg-violet-50"
                                >
                                  <td className="py-0.5 pr-3 font-mono font-bold text-gray-800">
                                    {tok}
                                  </td>
                                  <td className="py-0.5 pr-3 text-right text-gray-500">
                                    {(logits[i] ?? 0).toFixed(4)}
                                  </td>
                                  <td className="py-0.5 text-right font-semibold text-violet-700">
                                    {(scaledLogits[i] ?? 0).toFixed(4)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </Step>

                  <Arrow active={curPhaseIdx >= phaseIdx("softmax")} />

                  {/* ② Softmax */}
                  <Step
                    num="2"
                    label="Softmax：缩放后 logits 转概率分布"
                    active={isActive("softmax")}
                    done={isDone("softmax")}
                  >
                    {isActive("softmax") && scaledProbs.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] text-blue-600 bg-blue-50 rounded p-2 border border-blue-100 mb-3">
                          <InlineMath
                            math={`P_T(x_i) = \\frac{\\exp(z'_i)}{\\sum_j \\exp(z'_j)},\\quad H = -\\sum_i p_i \\ln p_i = ${entropy.toFixed(4)}`}
                          />
                        </div>

                        {/* 对比：基准 vs 温度调整 */}
                        <div className="grid grid-cols-2 gap-4">
                          <ProbBar
                            label={`基准（T=1.0），熵 = ${baseProbs.length > 0 ? (-baseProbs.reduce((a, p) => a + (p > 0 ? p * Math.log(p) : 0), 0)).toFixed(4) : "—"}`}
                            vocab={vocab}
                            probs={baseProbs}
                            maxProb={maxBaseProb}
                            argmaxIdx={argmaxIdx}
                            highlight="argmax"
                          />
                          <ProbBar
                            label={`当前（T=${temperature}），熵 = ${entropy.toFixed(4)}`}
                            vocab={vocab}
                            probs={scaledProbs}
                            maxProb={maxScaledProb}
                            argmaxIdx={argmaxIdx}
                            highlight="argmax"
                          />
                        </div>
                      </div>
                    )}
                  </Step>

                  <Arrow active={curPhaseIdx >= phaseIdx("sample")} />

                  {/* ③ 采样 */}
                  <Step
                    num="3"
                    label="按概率采样"
                    active={isActive("sample") || isActive("complete")}
                    done={false}
                  >
                    {["sample", "complete"].includes(phase) && sampledToken && (
                      <div className="mt-2 space-y-3">
                        <div className="text-[11px] text-emerald-700 bg-emerald-50 rounded p-2 border border-emerald-100">
                          随机数 <InlineMath math={`u = ${randVal.toFixed(4)}`} />，
                          按累积概率分布确定采样 token
                        </div>
                        <ProbBar
                          label={`采样分布（T=${temperature}）`}
                          vocab={vocab}
                          probs={scaledProbs}
                          maxProb={maxScaledProb}
                          sampledIdx={sampledIdx}
                          argmaxIdx={argmaxIdx}
                          highlight="sampled"
                        />
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
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

              {/* ═══ 分布对比（完成后展示）═══ */}
              {["softmax", "sample", "complete"].includes(phase) &&
                baseProbs.length > 0 &&
                scaledProbs.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">
                      概率分布对比：基准（T=1）vs 温度调整（T={temperature}）
                    </h4>
                    <p className="text-[11px] text-gray-400 mb-3">
                      温度越低，分布越尖锐，最高概率 token 被选中的概率越高；温度越高，分布越接近均匀
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                      <ProbBar
                        label={`基准 T=1.0（熵=${(-baseProbs.reduce((a, p) => a + (p > 0 ? p * Math.log(p) : 0), 0)).toFixed(4)}）`}
                        vocab={vocab}
                        probs={baseProbs}
                        maxProb={maxBaseProb}
                        argmaxIdx={argmaxIdx}
                        sampledIdx={
                          ["sample", "complete"].includes(phase) ? sampledIdx : undefined
                        }
                        highlight="sampled"
                      />
                      <ProbBar
                        label={`当前 T=${temperature}（熵=${entropy.toFixed(4)}）`}
                        vocab={vocab}
                        probs={scaledProbs}
                        maxProb={maxScaledProb}
                        argmaxIdx={argmaxIdx}
                        sampledIdx={
                          ["sample", "complete"].includes(phase) ? sampledIdx : undefined
                        }
                        highlight="sampled"
                      />
                    </div>
                  </div>
                )}

              {/* ═══ 完成结果 ═══ */}
              {finished && phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">采样完成 ✓</h4>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-violet-600 font-semibold text-base">{temperature}</div>
                      <div className="text-gray-500">温度 T</div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-blue-600 font-semibold text-base">{entropy.toFixed(3)}</div>
                      <div className="text-gray-500">分布熵（nats）</div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-gray-700 font-mono font-bold text-base">
                        {vocab[argmaxIdx] ?? "—"}
                      </div>
                      <div className="text-gray-500">最高概率 token</div>
                    </div>
                    <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center">
                      <div className="text-emerald-700 font-mono font-bold text-base">{sampledToken}</div>
                      <div className="text-gray-500">采样结果</div>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-700 mt-3">
                    温度 T = {temperature}，分布熵 = {entropy.toFixed(4)} nats
                    {temperature < 1
                      ? `（低温：比基准熵更小，分布更集中，确定性更高）`
                      : temperature > 1
                      ? `（高温：比基准熵更大，分布更均匀，随机性更高）`
                      : `（中性温度：保持原始 Softmax 分布）`}
                    ，最终采样 token："<strong>{sampledToken}</strong>"（概率 = {sampledProb.toFixed(4)}）。
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

export default TemperatureSamplingVisualizer;

import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateScaledDotProductAttentionSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface ScaledDotProductAttentionInput extends ProblemInput {
  Q: string;
  K: string;
  V: string;
  dk: number;
}

const DEFAULT_Q = "[[1,2],[3,4],[0,1]]";
const DEFAULT_K = "[[1,1],[2,2],[0,1]]";
const DEFAULT_V = "[[1,0,0],[0,1,0],[0,0,1]]";
const DEFAULT_DK = 2;

function parseMatrix(raw: string | number[][]): number[][] {
  if (Array.isArray(raw)) return raw as number[][];
  try {
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (row: unknown) =>
          Array.isArray(row) && row.every((v) => typeof v === "number")
      )
    ) {
      return parsed as number[][];
    }
  } catch {
    // fall through
  }
  return JSON.parse(DEFAULT_Q) as number[][];
}

function fmt(v?: number, digits = 3): string {
  if (v === undefined || isNaN(v)) return "--";
  return v.toFixed(digits);
}

function getHeatColor(weight: number): string {
  // 0 = cool blue, 1 = warm red
  const w = Math.max(0, Math.min(weight, 1));
  const hue = 220 - w * 180;
  const sat = 70;
  const light = 88 - w * 30;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

function getTextColor(weight: number): string {
  return weight > 0.5 ? "#fff" : "#1e293b";
}

interface MatrixGridProps {
  label: string;
  matrix: number[][];
  highlightRow?: number;
  colorFn?: (row: number, col: number, val: number) => string;
  badge?: string;
}

function MatrixGrid({ label, matrix, highlightRow, colorFn, badge }: MatrixGridProps) {
  if (!matrix || matrix.length === 0) return null;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">{label}</h4>
        {badge && (
          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="pr-2 text-gray-400 font-mono">r{i}</td>
                {row.map((val, j) => {
                  const bg = colorFn ? colorFn(i, j, val) : undefined;
                  const isHl = highlightRow === i;
                  return (
                    <td
                      key={j}
                      className={`w-14 h-9 text-center font-mono border border-gray-100 rounded transition-all ${
                        isHl ? "ring-2 ring-blue-400 font-semibold" : ""
                      }`}
                      style={{ backgroundColor: bg ?? (isHl ? "#eff6ff" : "#f8fafc") }}
                    >
                      {fmt(val, 2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface HeatmapGridProps {
  label: string;
  matrix: number[][];
  subtitle?: string;
}

function HeatmapGrid({ label, matrix, subtitle }: HeatmapGridProps) {
  if (!matrix || matrix.length === 0) return null;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-gray-800">{label}</h4>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="pr-2 text-gray-400 font-mono text-right w-6">q{i}</td>
                {row.map((val, j) => {
                  const bg = getHeatColor(val);
                  const tc = getTextColor(val);
                  return (
                    <td
                      key={j}
                      className="w-14 h-10 text-center font-mono border border-white/60 rounded transition-all"
                      style={{ backgroundColor: bg, color: tc }}
                      title={`Q[${i}] → K[${j}]: ${fmt(val)}`}
                    >
                      {fmt(val, 2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
        <span className="inline-block w-4 h-2 rounded" style={{ background: getHeatColor(0) }} />
        <span>低</span>
        <span className="inline-block w-4 h-2 rounded" style={{ background: getHeatColor(0.5) }} />
        <span className="inline-block w-4 h-2 rounded" style={{ background: getHeatColor(1) }} />
        <span>高</span>
      </div>
    </div>
  );
}

function PhaseTag({ phase }: { phase: string }) {
  const map: Record<string, { label: string; color: string }> = {
    init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
    "dot-product": { label: "点积 QKᵀ", color: "bg-blue-100 text-blue-700" },
    scale: { label: "缩放 /√d_k", color: "bg-violet-100 text-violet-700" },
    softmax: { label: "Softmax", color: "bg-amber-100 text-amber-700" },
    output: { label: "加权求和", color: "bg-emerald-100 text-emerald-700" },
    complete: { label: "计算完成", color: "bg-green-100 text-green-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function ScaledDotProductAttentionVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10002);

  return (
    <ConfigurableVisualizer<ScaledDotProductAttentionInput, Record<string, never>>
      config={{
        defaultInput: {
          Q: DEFAULT_Q,
          K: DEFAULT_K,
          V: DEFAULT_V,
          dk: DEFAULT_DK,
        },
        algorithm: (input) => {
          const Q = parseMatrix(input.Q as string | number[][]);
          const K = parseMatrix(input.K as string | number[][]);
          const V = parseMatrix(input.V as string | number[][]);
          const dk =
            typeof input.dk === "number"
              ? input.dk
              : parseFloat(String(input.dk)) || DEFAULT_DK;
          return generateScaledDotProductAttentionSteps(Q, K, V, dk);
        },
        inputTypes: [
          { type: "string", key: "Q", label: "Q 矩阵（JSON）" },
          { type: "string", key: "K", label: "K 矩阵（JSON）" },
          { type: "string", key: "V", label: "V 矩阵（JSON）" },
          { type: "number", key: "dk", label: "d_k（Key 维度）", min: 1 },
        ],
        inputFields: [
          {
            type: "string",
            key: "Q",
            label: "Q 矩阵（JSON）",
            placeholder: DEFAULT_Q,
          },
          {
            type: "string",
            key: "K",
            label: "K 矩阵（JSON）",
            placeholder: DEFAULT_K,
          },
          {
            type: "string",
            key: "V",
            label: "V 矩阵（JSON）",
            placeholder: DEFAULT_V,
          },
          {
            type: "number",
            key: "dk",
            label: "d_k（Key 维度）",
            placeholder: String(DEFAULT_DK),
          },
        ],
        testCases: [
          {
            label: "示例（3 Token）",
            value: { Q: DEFAULT_Q, K: DEFAULT_K, V: DEFAULT_V, dk: DEFAULT_DK },
          },
          {
            label: "问题定义示例",
            value: {
              Q: "[[1,2],[3,4]]",
              K: "[[1,1],[2,2]]",
              V: "[[0.5,1],[1.5,2]]",
              dk: 2,
            },
          },
          {
            label: "4 Token / d_k=4",
            value: {
              Q: "[[1,0,1,0],[0,1,0,1],[1,1,0,0],[0,0,1,1]]",
              K: "[[1,0,1,0],[0,1,0,1],[1,1,0,0],[0,0,1,1]]",
              V: "[[1,0],[0,1],[1,1],[0,0]]",
              dk: 4,
            },
          },
        ],
        render: ({ visualization, variables }) => {
          const currentInput = visualization.input as ScaledDotProductAttentionInput;
          const Q = parseMatrix(currentInput.Q as string | number[][]);
          const K = parseMatrix(currentInput.K as string | number[][]);
          const V = parseMatrix(currentInput.V as string | number[][]);

          const phase = (variables?.phase as string) ?? "init";
          const currentQueryIdx = variables?.currentQueryIdx as number | undefined;
          const scores = (variables?.scores as number[][] | undefined) ?? [];
          const scaledScores = (variables?.scaledScores as number[][] | undefined) ?? [];
          const attentionWeights = (variables?.attentionWeights as number[][] | undefined) ?? [];
          const output = (variables?.output as number[][] | undefined) ?? [];
          const scale = variables?.scale as number | undefined;

          const showScores = ["dot-product", "scale", "softmax", "output", "complete"].includes(phase);
          const showScaled = ["scale", "softmax", "output", "complete"].includes(phase);
          const showWeights = ["softmax", "output", "complete"].includes(phase);
          const showOutput = ["output", "complete"].includes(phase);

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题与公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      缩放点积注意力
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      Attention(Q,K,V) = softmax( QKᵀ / √d_k ) · V
                    </p>
                  </div>
                  <PhaseTag phase={phase} />
                </div>
                {scale !== undefined && (
                  <p className="text-xs text-gray-400 mt-2">
                    缩放因子：1/√{currentInput.dk} = {scale.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Q K V 矩阵 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MatrixGrid
                  label="Q（Query）"
                  matrix={Q}
                  highlightRow={phase === "dot-product" ? currentQueryIdx : undefined}
                  badge={`${Q.length}×${Q[0]?.length}`}
                />
                <MatrixGrid
                  label="K（Key）"
                  matrix={K}
                  badge={`${K.length}×${K[0]?.length}`}
                />
                <MatrixGrid
                  label="V（Value）"
                  matrix={V}
                  badge={`${V.length}×${V[0]?.length}`}
                />
              </div>

              {/* 分数矩阵与注意力权重 */}
              {showScores && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <HeatmapGrid
                    label="注意力分数（QKᵀ）"
                    matrix={showScaled ? scaledScores : scores}
                    subtitle={
                      showScaled
                        ? `已除以 √d_k（= ${scale?.toFixed(4) ?? "?"}）`
                        : "原始点积分数"
                    }
                  />
                  {showWeights ? (
                    <HeatmapGrid
                      label="注意力权重（Softmax）"
                      matrix={attentionWeights}
                      subtitle="每行之和为 1，颜色越深关注度越高"
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-dashed border-gray-200 p-4 flex items-center justify-center">
                      <p className="text-xs text-gray-400">等待 Softmax 步骤…</p>
                    </div>
                  )}
                </div>
              )}

              {/* 输出矩阵 */}
              {showOutput && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">
                        输出矩阵（attention weights · V）
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        每行融合了所有 Token 的 Value 信息，由注意力权重加权
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                      {output.length}×{output[0]?.length}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse">
                      <tbody>
                        {output.map((row, i) => (
                          <tr key={i}>
                            <td className="pr-2 text-gray-400 font-mono text-right w-6">
                              out{i}
                            </td>
                            {row.map((val, j) => (
                              <td
                                key={j}
                                className="w-16 h-10 text-center font-mono border border-gray-100 rounded bg-emerald-50 text-emerald-800"
                              >
                                {fmt(val, 3)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 计算流程示意 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入 Q/K/V" },
                    { id: "dot-product", label: "② QKᵀ 点积" },
                    { id: "scale", label: "③ /√d_k 缩放" },
                    { id: "softmax", label: "④ Softmax" },
                    { id: "output", label: "⑤ × V 加权" },
                    { id: "complete", label: "⑥ 输出" },
                  ].map((step, idx, arr) => {
                    const isDone =
                      arr.findIndex((s) => s.id === phase) >= idx;
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                            step.id === phase
                              ? "bg-blue-600 text-white shadow-sm"
                              : isDone
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                        {idx < arr.length - 1 && (
                          <span className="text-gray-300">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default ScaledDotProductAttentionVisualizer;

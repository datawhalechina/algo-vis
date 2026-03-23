import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateSelfAttentionSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface SelfAttentionInput extends ProblemInput {
  X: string;
  WQ: string;
  WK: string;
  WV: string;
  dk: number;
}

const DEFAULT_X = "[[1,0,1,0],[0,1,0,1],[1,1,0,0]]";
const DEFAULT_WQ = "[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]";
const DEFAULT_WK = "[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]";
const DEFAULT_WV = "[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]";
const DEFAULT_DK = 4;

function parseMatrix(raw: string | number[][], fallback: string): number[][] {
  if (Array.isArray(raw)) return raw as number[][];
  try {
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (row: unknown) =>
          Array.isArray(row) &&
          (row as unknown[]).every((v) => typeof v === "number")
      )
    ) {
      return parsed as number[][];
    }
  } catch {
    // fall through
  }
  return JSON.parse(fallback) as number[][];
}

function fmt(v?: number, digits = 2): string {
  if (v === undefined || isNaN(v)) return "--";
  return v.toFixed(digits);
}

function getHeatColor(weight: number): string {
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
  badge?: string;
  accentColor?: string;
}

function MatrixGrid({ label, matrix, highlightRow, badge, accentColor }: MatrixGridProps) {
  if (!matrix || matrix.length === 0) return null;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-800">{label}</h4>
        {badge && (
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: accentColor ? `${accentColor}20` : "#eff6ff",
              color: accentColor ?? "#1d4ed8",
            }}
          >
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
                  const isHl = highlightRow === i;
                  return (
                    <td
                      key={j}
                      className={`w-14 h-9 text-center font-mono border border-gray-100 rounded transition-all ${
                        isHl ? "ring-2 ring-blue-400 font-semibold" : ""
                      }`}
                      style={{ backgroundColor: isHl ? "#eff6ff" : "#f8fafc" }}
                    >
                      {fmt(val)}
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
                      title={`Q[${i}] → K[${j}]: ${fmt(val, 3)}`}
                    >
                      {fmt(val)}
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
    "project-q": { label: "投影 Q", color: "bg-blue-100 text-blue-700" },
    "project-k": { label: "投影 K", color: "bg-green-100 text-green-700" },
    "project-v": { label: "投影 V", color: "bg-orange-100 text-orange-700" },
    "dot-product": { label: "点积 QKᵀ", color: "bg-violet-100 text-violet-700" },
    scale: { label: "缩放 /√d_k", color: "bg-purple-100 text-purple-700" },
    softmax: { label: "Softmax", color: "bg-amber-100 text-amber-700" },
    output: { label: "加权求和", color: "bg-emerald-100 text-emerald-700" },
    complete: { label: "计算完成", color: "bg-green-100 text-green-700" },
    error: { label: "输入错误", color: "bg-red-100 text-red-700" },
  };
  const info = map[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}

function SelfAttentionVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10004);

  return (
    <ConfigurableVisualizer<SelfAttentionInput, Record<string, never>>
      config={{
        defaultInput: {
          X: DEFAULT_X,
          WQ: DEFAULT_WQ,
          WK: DEFAULT_WK,
          WV: DEFAULT_WV,
          dk: DEFAULT_DK,
        },
        algorithm: (input) => {
          const X = parseMatrix(input.X as string | number[][], DEFAULT_X);
          const WQ = parseMatrix(input.WQ as string | number[][], DEFAULT_WQ);
          const WK = parseMatrix(input.WK as string | number[][], DEFAULT_WK);
          const WV = parseMatrix(input.WV as string | number[][], DEFAULT_WV);
          const dk =
            typeof input.dk === "number"
              ? input.dk
              : parseFloat(String(input.dk)) || DEFAULT_DK;
          return generateSelfAttentionSteps(X, WQ, WK, WV, dk);
        },
        inputTypes: [
          { type: "string", key: "X", label: "输入序列 X（JSON）" },
          { type: "string", key: "WQ", label: "W_Q 矩阵（JSON）" },
          { type: "string", key: "WK", label: "W_K 矩阵（JSON）" },
          { type: "string", key: "WV", label: "W_V 矩阵（JSON）" },
          { type: "number", key: "dk", label: "d_k（Key 维度）", min: 1 },
        ],
        inputFields: [
          {
            type: "string",
            key: "X",
            label: "输入序列 X（JSON）",
            placeholder: DEFAULT_X,
          },
          {
            type: "string",
            key: "WQ",
            label: "W_Q 矩阵（JSON）",
            placeholder: DEFAULT_WQ,
          },
          {
            type: "string",
            key: "WK",
            label: "W_K 矩阵（JSON）",
            placeholder: DEFAULT_WK,
          },
          {
            type: "string",
            key: "WV",
            label: "W_V 矩阵（JSON）",
            placeholder: DEFAULT_WV,
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
            label: "示例（3 Token, d=4）",
            value: {
              X: DEFAULT_X,
              WQ: DEFAULT_WQ,
              WK: DEFAULT_WK,
              WV: DEFAULT_WV,
              dk: DEFAULT_DK,
            },
          },
          {
            label: "2 Token 示例",
            value: {
              X: "[[1,0],[0,1]]",
              WQ: "[[1,0],[0,1]]",
              WK: "[[1,0],[0,1]]",
              WV: "[[1,0],[0,1]]",
              dk: 2,
            },
          },
          {
            label: "4 Token / 随机权重",
            value: {
              X: "[[1,0,1,0],[0,1,0,1],[1,1,0,0],[0,0,1,1]]",
              WQ: "[[0.5,0.5,0,0],[0.5,-0.5,0,0],[0,0,0.5,0.5],[0,0,0.5,-0.5]]",
              WK: "[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]",
              WV: "[[0,1,0,0],[1,0,0,0],[0,0,0,1],[0,0,1,0]]",
              dk: 4,
            },
          },
        ],
        render: ({ visualization, variables }) => {
          const currentInput = visualization.input as SelfAttentionInput;
          const X = parseMatrix(currentInput.X as string | number[][], DEFAULT_X);
          const WQ = parseMatrix(currentInput.WQ as string | number[][], DEFAULT_WQ);
          const WK = parseMatrix(currentInput.WK as string | number[][], DEFAULT_WK);
          const WV = parseMatrix(currentInput.WV as string | number[][], DEFAULT_WV);

          const phase = (variables?.phase as string) ?? "init";
          const currentQueryIdx = variables?.currentQueryIdx as number | undefined;
          const scores = (variables?.scores as number[][] | undefined) ?? [];
          const scaledScores = (variables?.scaledScores as number[][] | undefined) ?? [];
          const attentionWeights =
            (variables?.attentionWeights as number[][] | undefined) ?? [];
          const output = (variables?.output as number[][] | undefined) ?? [];
          const scale = variables?.scale as number | undefined;

          const Q = (variables?.Q as number[][] | undefined) ?? [];
          const K = (variables?.K as number[][] | undefined) ?? [];
          const V = (variables?.V as number[][] | undefined) ?? [];

          const showQ = [
            "project-q", "project-k", "project-v",
            "dot-product", "scale", "softmax", "output", "complete",
          ].includes(phase);
          const showK = [
            "project-k", "project-v",
            "dot-product", "scale", "softmax", "output", "complete",
          ].includes(phase);
          const showV = [
            "project-v",
            "dot-product", "scale", "softmax", "output", "complete",
          ].includes(phase);
          const showScores = [
            "dot-product", "scale", "softmax", "output", "complete",
          ].includes(phase);
          const showScaled = ["scale", "softmax", "output", "complete"].includes(phase);
          const showWeights = ["softmax", "output", "complete"].includes(phase);
          const showOutput = ["output", "complete"].includes(phase);

          const activeWeight =
            phase === "project-q" ? "W_Q" :
            phase === "project-k" ? "W_K" :
            phase === "project-v" ? "W_V" : null;

          const flowSteps = [
            { id: "init", label: "① X 输入" },
            { id: "project-q", label: "② 投影 Q" },
            { id: "project-k", label: "③ 投影 K" },
            { id: "project-v", label: "④ 投影 V" },
            { id: "dot-product", label: "⑤ QKᵀ 点积" },
            { id: "scale", label: "⑥ /√d_k" },
            { id: "softmax", label: "⑦ Softmax" },
            { id: "output", label: "⑧ × V" },
            { id: "complete", label: "⑨ 输出" },
          ];

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题与公式 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      自注意力机制
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      Q=X·W_Q, K=X·W_K, V=X·W_V → softmax(QKᵀ/√d_k)·V
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

              {/* 线性投影面板：X 和三个权重矩阵 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  线性投影（Q = X·W_Q，K = X·W_K，V = X·W_V）
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <MatrixGrid
                    label="X（输入序列）"
                    matrix={X}
                    badge={`${X.length}×${X[0]?.length}`}
                    accentColor="#6366f1"
                  />
                  <MatrixGrid
                    label={activeWeight === "W_Q" ? "W_Q ←" : "W_Q"}
                    matrix={WQ}
                    badge={`${WQ.length}×${WQ[0]?.length}`}
                    accentColor={activeWeight === "W_Q" ? "#3b82f6" : undefined}
                  />
                  <MatrixGrid
                    label={activeWeight === "W_K" ? "W_K ←" : "W_K"}
                    matrix={WK}
                    badge={`${WK.length}×${WK[0]?.length}`}
                    accentColor={activeWeight === "W_K" ? "#22c55e" : undefined}
                  />
                  <MatrixGrid
                    label={activeWeight === "W_V" ? "W_V ←" : "W_V"}
                    matrix={WV}
                    badge={`${WV.length}×${WV[0]?.length}`}
                    accentColor={activeWeight === "W_V" ? "#f97316" : undefined}
                  />
                </div>
              </div>

              {/* Q / K / V 投影结果 */}
              {(showQ || showK || showV) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {showQ && (
                    <MatrixGrid
                      label="Q（Query = X·W_Q）"
                      matrix={Q}
                      highlightRow={phase === "dot-product" ? currentQueryIdx : undefined}
                      badge={`${Q.length}×${Q[0]?.length}`}
                      accentColor="#3b82f6"
                    />
                  )}
                  {showK && (
                    <MatrixGrid
                      label="K（Key = X·W_K）"
                      matrix={K}
                      badge={`${K.length}×${K[0]?.length}`}
                      accentColor="#22c55e"
                    />
                  )}
                  {showV && (
                    <MatrixGrid
                      label="V（Value = X·W_V）"
                      matrix={V}
                      badge={`${V.length}×${V[0]?.length}`}
                      accentColor="#f97316"
                    />
                  )}
                </div>
              )}

              {/* 注意力分数与权重热力图 */}
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
                        自注意力输出（attention weights · V）
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        每个 Token 的输出都融合了序列中所有位置的上下文信息
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
                            <td className="pr-2 text-gray-400 font-mono text-right w-8">
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

              {/* 计算流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {flowSteps.map((step, idx, arr) => {
                    const isDone = arr.findIndex((s) => s.id === phase) >= idx;
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

export default SelfAttentionVisualizer;

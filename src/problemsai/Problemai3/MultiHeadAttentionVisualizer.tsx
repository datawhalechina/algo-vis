import type { CSSProperties } from "react";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateMultiHeadAttentionSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface MultiHeadAttentionInput extends ProblemInput {
  Q: string;
  K: string;
  V: string;
  num_heads: number;
}

const defaultQ =
  "[[0.5,0.3,0.8,0.2],[0.1,0.9,0.4,0.7],[0.6,0.2,0.5,0.9]]";
const defaultK =
  "[[0.7,0.4,0.3,0.6],[0.2,0.8,0.5,0.1],[0.9,0.3,0.7,0.4]]";
const defaultV =
  "[[0.4,0.6,0.2,0.8],[0.7,0.3,0.9,0.1],[0.1,0.5,0.6,0.4]]";

function parseMatrix(raw: string | number[][]): number[][] {
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
  } catch (e) {
    console.warn("矩阵解析失败，使用默认值。", e);
  }
  return JSON.parse(defaultQ) as number[][];
}

function getHeatmapStyle(weight: number): CSSProperties {
  const w = Math.max(0, Math.min(weight, 1));
  const hue = 220 - w * 180;
  const lightness = 88 - w * 30;
  return { backgroundColor: `hsl(${hue}, 70%, ${lightness}%)` };
}

function getNormalizedStyle(
  value: number,
  min: number,
  max: number
): CSSProperties {
  const w = max === min ? 0.5 : (value - min) / (max - min);
  return getHeatmapStyle(w);
}

function fmt(v?: number, d = 2): string {
  if (v === undefined || isNaN(v)) return "—";
  return v.toFixed(d);
}

const HEAD_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", cell: "#EFF6FF" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", cell: "#F5F3FF" },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", cell: "#ECFDF5" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", cell: "#FFFBEB" },
];

function getHeadColor(h: number) {
  return HEAD_COLORS[h % HEAD_COLORS.length];
}

function MatrixTable({
  matrix,
  label,
  colorFn,
}: {
  matrix: number[][];
  label: string;
  colorFn?: (v: number) => CSSProperties;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-700 mb-1">{label}</div>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                {row.map((v, j) => (
                  <td
                    key={j}
                    className="w-12 h-8 border border-gray-200 text-center font-mono text-gray-800"
                    style={colorFn ? colorFn(v) : undefined}
                  >
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttentionHeatmap({
  weights,
  label,
}: {
  weights: number[][];
  label: string;
}) {
  return (
    <MatrixTable
      matrix={weights}
      label={label}
      colorFn={(v) => getHeatmapStyle(v)}
    />
  );
}

const PHASES = [
  "init",
  "split",
  "scores",
  "softmax",
  "head-output",
  "concat",
  "complete",
];

const PHASE_LABELS: Record<string, string> = {
  init: "初始化",
  split: "分割子矩阵",
  scores: "计算注意力分数",
  softmax: "Softmax 归一化",
  "head-output": "头输出",
  concat: "拼接输出",
  complete: "完成",
};

function MultiHeadAttentionVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10003);

  return (
    <ConfigurableVisualizer<MultiHeadAttentionInput, Record<string, never>>
      config={{
        defaultInput: {
          Q: defaultQ,
          K: defaultK,
          V: defaultV,
          num_heads: 2,
        },
        algorithm: (input) => {
          const Q = parseMatrix(input.Q as string);
          const K = parseMatrix(input.K as string);
          const V = parseMatrix(input.V as string);
          const numHeads = Math.max(
            1,
            Math.floor(Number(input.num_heads) || 2)
          );
          return generateMultiHeadAttentionSteps(Q, K, V, numHeads);
        },
        inputTypes: [
          { type: "string", key: "Q", label: "Q 矩阵（JSON）" },
          { type: "string", key: "K", label: "K 矩阵（JSON）" },
          { type: "string", key: "V", label: "V 矩阵（JSON）" },
          { type: "number", key: "num_heads", label: "注意力头数", min: 1 },
        ],
        inputFields: [
          {
            type: "string",
            key: "Q",
            label: "Q 矩阵（JSON）",
            placeholder: defaultQ,
          },
          {
            type: "string",
            key: "K",
            label: "K 矩阵（JSON）",
            placeholder: defaultK,
          },
          {
            type: "string",
            key: "V",
            label: "V 矩阵（JSON）",
            placeholder: defaultV,
          },
          {
            type: "number",
            key: "num_heads",
            label: "注意力头数",
            placeholder: "2",
          },
        ],
        testCases: [
          {
            label: "默认示例（3×4，2头）",
            value: { Q: defaultQ, K: defaultK, V: defaultV, num_heads: 2 },
          },
          {
            label: "4头注意力（4×8，4头）",
            value: {
              Q: "[[1,0,0,1,0,1,0,0],[0,1,0,0,1,0,1,0],[0,0,1,0,0,1,0,1],[1,1,0,0,1,0,0,1]]",
              K: "[[0.5,0.5,0,0,0.5,0,0.5,0],[0,0.5,0.5,0,0,0.5,0,0.5],[0.5,0,0.5,0,0,0,0.5,0.5],[0,0.5,0,0.5,0.5,0.5,0,0]]",
              V: "[[1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1],[1,1,0,0,1,1,0,0],[0,0,1,1,0,0,1,1]]",
              num_heads: 4,
            },
          },
        ],
        render: ({ visualization, variables }) => {
          const input = visualization.input as MultiHeadAttentionInput;
          const Q = parseMatrix(input.Q as string);
          const K = parseMatrix(input.K as string);
          const V = parseMatrix(input.V as string);
          const numHeads = Math.max(
            1,
            Math.floor(Number(input.num_heads) || 2)
          );
          const seqLen = Q.length;
          const dModel = Q[0]?.length ?? 0;
          const dK =
            dModel > 0 && numHeads > 0 ? Math.floor(dModel / numHeads) : 0;

          const phase = (variables?.phase as string) ?? "init";
          const currentHead = (variables?.currentHead as number) ?? 0;
          const Qh = (variables?.Qh as unknown as number[][]) ?? [];
          const Kh = (variables?.Kh as unknown as number[][]) ?? [];
          const Vh = (variables?.Vh as unknown as number[][]) ?? [];
          const scaledScores =
            (variables?.scaledScores as unknown as number[][]) ?? [];
          const weights = (variables?.weights as unknown as number[][]) ?? [];
          const headWeights =
            (variables?.headWeights as unknown as number[][][]) ?? [];
          const headOutputs =
            (variables?.headOutputs as unknown as number[][][]) ?? [];
          const concatOutput =
            (variables?.concatOutput as unknown as number[][]) ?? [];

          const phaseIndex = PHASES.indexOf(phase);
          const showCurrentHead = ["split", "scores", "softmax"].includes(
            phase
          );
          const showScores = ["scores", "softmax"].includes(phase);
          const showWeights = ["softmax"].includes(phase);
          const showHeadHistory = headWeights.length > 0;
          const showConcat = ["concat", "complete"].includes(phase);

          // Compute score normalization bounds for display
          let scoreMin = 0;
          let scoreMax = 1;
          if (scaledScores.length > 0) {
            const flat = scaledScores.flat();
            scoreMin = Math.min(...flat);
            scoreMax = Math.max(...flat);
          }

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* Overview */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">
                    多头注意力机制
                  </h3>
                  <span className="text-xs px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">
                    {PHASE_LABELS[phase] ?? phase}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-3">
                  <span>
                    序列长度：<strong className="text-gray-900">{seqLen}</strong>
                  </span>
                  <span>
                    d_model：<strong className="text-gray-900">{dModel}</strong>
                  </span>
                  <span>
                    注意力头数：
                    <strong className="text-gray-900">{numHeads}</strong>
                  </span>
                  <span>
                    每头维度 d_k：
                    <strong className="text-gray-900">{dK}</strong>
                  </span>
                  <span>
                    缩放因子：
                    <strong className="text-gray-900">
                      1/√{dK} ≈ {dK > 0 ? (1 / Math.sqrt(dK)).toFixed(3) : "—"}
                    </strong>
                  </span>
                </div>
                {/* Phase progress bar */}
                <div className="flex gap-1 mt-1">
                  {PHASES.map((p, i) => (
                    <div
                      key={p}
                      title={PHASE_LABELS[p]}
                      className={`h-1.5 rounded-full flex-1 transition-colors ${
                        i < phaseIndex
                          ? "bg-blue-400"
                          : i === phaseIndex
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Input matrices (init only) */}
              {phase === "init" && Q.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    输入矩阵 Q / K / V（{seqLen}×{dModel}）
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    每个矩阵将被切分为 {numHeads} 个子矩阵，每个注意力头各使用一份（{seqLen}×{dK}）。
                  </p>
                  <div className="grid gap-4 md:grid-cols-3">
                    <MatrixTable matrix={Q} label="Q（Query）" />
                    <MatrixTable matrix={K} label="K（Key）" />
                    <MatrixTable matrix={V} label="V（Value）" />
                  </div>
                </div>
              )}

              {/* Current head being processed */}
              {showCurrentHead && Qh.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-800">
                      Head {currentHead + 1} 正在处理
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getHeadColor(currentHead).bg} ${getHeadColor(currentHead).text}`}
                    >
                      列 [{currentHead * dK} : {currentHead * dK + dK}]
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mb-4">
                    <MatrixTable
                      matrix={Qh}
                      label={`Q_${currentHead + 1} (${seqLen}×${dK})`}
                    />
                    <MatrixTable
                      matrix={Kh}
                      label={`K_${currentHead + 1} (${seqLen}×${dK})`}
                    />
                    <MatrixTable
                      matrix={Vh}
                      label={`V_${currentHead + 1} (${seqLen}×${dK})`}
                    />
                  </div>

                  {showScores && scaledScores.length > 0 && (
                    <div className="mb-4">
                      <MatrixTable
                        matrix={scaledScores}
                        label={`注意力得分 = Q_${currentHead + 1} × K_${currentHead + 1}^T / √${dK}`}
                        colorFn={(v) =>
                          getNormalizedStyle(v, scoreMin, scoreMax)
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        颜色深浅表示相对大小（归一化显示）
                      </p>
                    </div>
                  )}

                  {showWeights && weights.length > 0 && (
                    <div>
                      <AttentionHeatmap
                        weights={weights}
                        label={`注意力权重（Softmax）— 每行之和为 1`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        颜色越红表示权重越高，该 token 对结果贡献越大
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Completed heads */}
              {showHeadHistory && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    已完成的注意力头（{headWeights.length} / {numHeads}）
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {headWeights.map((hw, h) => {
                      const color = getHeadColor(h);
                      return (
                        <div
                          key={h}
                          className={`rounded-lg border p-3 ${color.bg} ${color.border}`}
                        >
                          <div
                            className={`text-xs font-semibold mb-2 ${color.text}`}
                          >
                            Head {h + 1}
                          </div>
                          <AttentionHeatmap
                            weights={hw}
                            label={`注意力权重`}
                          />
                          {headOutputs[h] && (
                            <div className="mt-2">
                              <MatrixTable
                                matrix={headOutputs[h]}
                                label={`输出 (${seqLen}×${dK})`}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Concatenated output */}
              {showConcat && concatOutput.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    拼接输出（{seqLen}×{dModel}）
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    将 {numHeads} 个头的输出沿列方向拼接，恢复原始维度。不同底色的列块来自不同的注意力头。
                  </p>
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse">
                      <thead>
                        <tr>
                          {Array.from({ length: dModel }, (_, j) => {
                            const headIdx = Math.floor(j / dK);
                            const color = getHeadColor(headIdx);
                            const isFirst = j % dK === 0;
                            return (
                              <th
                                key={j}
                                className={`w-12 h-6 border border-gray-200 text-center font-semibold ${color.text} ${color.bg} ${isFirst ? "border-l-2" : ""}`}
                              >
                                {isFirst ? `H${headIdx + 1}` : ""}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {concatOutput.map((row, i) => (
                          <tr key={i}>
                            {row.map((v, j) => {
                              const headIdx = Math.floor(j / dK);
                              const color = getHeadColor(headIdx);
                              const isFirst = j % dK === 0;
                              return (
                                <td
                                  key={j}
                                  className={`w-12 h-8 border border-gray-200 text-center font-mono text-gray-800 ${isFirst ? "border-l-2" : ""}`}
                                  style={{ backgroundColor: color.cell }}
                                >
                                  {fmt(v)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {phase === "complete" && (
                    <div className="mt-3 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      ✓ 多头注意力计算完成！{numHeads}{" "}
                      个头并行捕获了不同类型的依赖关系（语义、位置、句法等），拼接后可再经 W_O 线性变换输出。
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
}

export default MultiHeadAttentionVisualizer;

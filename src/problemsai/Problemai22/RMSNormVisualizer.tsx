import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateRMSNormSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

const PROBLEM_ID = 10022;

interface RMSNormInput extends ProblemInput {
  seqLen: number;
  dModel: number;
  eps: number;
}

function heatColor(v: number, min: number, max: number): string {
  const ratio = max === min ? 0.5 : (v - min) / (max - min);
  const hue = Math.round((1 - ratio) * 240);
  return `hsl(${hue}, 70%, 85%)`;
}

function fmt(v: number, d = 3): string {
  return Number.isFinite(v) ? v.toFixed(d) : "--";
}

interface MatrixGridProps {
  matrix: number[][];
  label: string;
  maxCols?: number;
}
function MatrixGrid({ matrix, label, maxCols = 8 }: MatrixGridProps) {
  const rows = matrix.length;
  const cols = Math.min(matrix[0]?.length ?? 0, maxCols);
  const allVals = matrix.flatMap((r) => r.slice(0, cols));
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);

  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">
        {label}
        <span className="font-normal text-gray-400 ml-1">[{rows}×{matrix[0]?.length ?? 0}]</span>
      </div>
      <table className="border-collapse text-xs font-mono">
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.slice(0, cols).map((v, j) => (
                <td key={j} className="w-10 h-7 text-center border border-white rounded" style={{ backgroundColor: heatColor(v, minV, maxV) }}>
                  {fmt(v, 2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PIPELINE_STEPS = [
  { key: "init", label: "输入" },
  { key: "squares", label: "计算平方" },
  { key: "compute_rms", label: "计算 RMS" },
  { key: "normalize", label: "归一化" },
  { key: "scale", label: "缩放（γ）" },
  { key: "done", label: "完成" },
];

function PipelineBar({ phase }: { phase: string }) {
  const currentIdx = PIPELINE_STEPS.findIndex((s) => s.key === phase);
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-center gap-0.5 text-xs min-w-max">
        {PIPELINE_STEPS.map((s, idx) => {
          const isDone = idx < currentIdx;
          const isActive = s.key === phase;
          return (
            <div key={s.key} className="flex items-center">
              <div className={`px-2 py-1 rounded whitespace-nowrap ${isActive ? "bg-cyan-600 text-white font-semibold" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                {s.label}
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className={`w-2.5 h-0.5 mx-0.5 ${isDone || isActive ? "bg-cyan-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RMSNormVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<RMSNormInput, Record<string, never>>
      config={{
        defaultInput: { seqLen: 3, dModel: 6, eps: 0.00001 },

        algorithm: (input) => {
          const seqLen = Math.max(2, Math.min(5, input.seqLen ?? 3));
          const dModel = Math.max(2, Math.min(8, input.dModel ?? 6));
          const eps = input.eps ?? 1e-5;
          return generateRMSNormSteps(seqLen, dModel, eps);
        },

        inputTypes: [
          { type: "number", key: "seqLen", label: "序列长度" },
          { type: "number", key: "dModel", label: "特征维度" },
        ],
        inputFields: [
          { type: "number", key: "seqLen", label: "序列长度 seq_len", placeholder: "3" },
          { type: "number", key: "dModel", label: "特征维度 d_model", placeholder: "6" },
        ],
        testCases: [
          { label: "默认（3×6）", value: { seqLen: 3, dModel: 6, eps: 0.00001 } },
          { label: "更多 token（5×6）", value: { seqLen: 5, dModel: 6, eps: 0.00001 } },
          { label: "大维度（3×8）", value: { seqLen: 3, dModel: 8, eps: 0.00001 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const X = variables?.X as number[][] | undefined;
          const X_squared = variables?.X_squared as number[][] | undefined;
          const meanSquares = variables?.meanSquares as number[] | undefined;
          const rms = variables?.rms as number[] | undefined;
          const normalized = variables?.normalized as number[][] | undefined;
          const output = variables?.output as number[][] | undefined;
          const ln_mean = variables?.ln_mean as number[] | undefined;
          const ln_std = variables?.ln_std as number[] | undefined;
          const ln_output = variables?.ln_output as number[][] | undefined;
          const seqLen = (variables?.seqLen as number) ?? 3;
          const dModel = (variables?.dModel as number) ?? 6;
          const eps = (variables?.eps as number) ?? 1e-5;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">RMS 归一化（RMSNorm）</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  seq_len={seqLen} · d_model={dModel} · ε={eps}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <PipelineBar phase={phase} />
              </div>

              {/* LayerNorm vs RMSNorm */}
              <div className="bg-cyan-50 rounded-lg border border-cyan-200 p-4">
                <h4 className="text-sm font-semibold text-cyan-800 mb-3">LayerNorm vs RMSNorm</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="font-semibold text-gray-700 mb-2">LayerNorm</div>
                    <div className="text-gray-600 space-y-1">
                      <div>1. 计算均值 μ</div>
                      <div>2. 计算方差 σ²</div>
                      <div>3. 标准化 (x-μ)/σ</div>
                      <div>4. 缩放 γ·x + β</div>
                    </div>
                    <div className="text-gray-500 mt-2">参数：γ + β（2×d_model）</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-cyan-200">
                    <div className="font-semibold text-cyan-700 mb-2">RMSNorm ★</div>
                    <div className="text-cyan-700 space-y-1">
                      <div>1. 计算均方根 RMS</div>
                      <div className="line-through text-gray-300">2. 计算方差（跳过）</div>
                      <div>3. 归一化 x/RMS</div>
                      <div>4. 缩放 γ·x</div>
                    </div>
                    <div className="text-cyan-600 mt-2 font-medium">参数：γ（1×d_model）</div>
                  </div>
                </div>
              </div>

              {/* Data flow */}
              {X && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <MatrixGrid matrix={X} label="输入 X" />
                </div>
              )}

              {X_squared && meanSquares && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    计算平方值&nbsp;
                    <span className="font-normal text-xs text-gray-500">
                      <InlineMath math="\text{mean\_sq}[i] = \frac{1}{d} \sum_j x_{ij}^2" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={X_squared} label="x² 矩阵" />
                  <div className="mt-3 overflow-x-auto">
                    <table className="text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-2 border border-gray-200">Token</th>
                          <th className="p-2 border border-gray-200">mean_sq = Σx²/d</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meanSquares.map((ms, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="p-2 border border-gray-200 font-mono">token {i}</td>
                            <td className="p-2 border border-gray-200 text-center font-mono">{fmt(ms, 4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {rms && (
                <div className="bg-cyan-50 rounded-lg border border-cyan-200 p-4">
                  <h4 className="text-sm font-semibold text-cyan-800 mb-2">
                    RMS 值&nbsp;
                    <span className="font-normal text-xs text-cyan-600">
                      <InlineMath math="\text{RMS}(x) = \sqrt{\frac{1}{d}\sum_j x_j^2 + \varepsilon}" />
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rms.map((r, i) => (
                      <div key={i} className="bg-white border border-cyan-200 rounded px-3 py-1.5 text-xs">
                        <span className="text-cyan-700 font-medium">token {i}：</span>
                        <span className="font-mono">{fmt(r, 4)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-cyan-600 mt-2">
                    每个 token 对应一个标量 RMS 值，用于归一化该 token 的所有维度
                  </p>
                </div>
              )}

              {normalized && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    归一化结果&nbsp;
                    <span className="font-normal text-xs text-gray-500">
                      <InlineMath math="\hat{x} = x / \text{RMS}(x)" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={normalized} label="normalized（每行 RMS ≈ 1）" />
                </div>
              )}

              {output && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    输出 γ ⊙ x̂（γ 初始化为全 1）
                  </h4>
                  <MatrixGrid matrix={output} label={`output [${seqLen}×${dModel}]`} />
                </div>
              )}

              {/* Comparison with LayerNorm */}
              {ln_mean && ln_std && ln_output && output && (
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                  <h4 className="text-sm font-semibold text-amber-800 mb-3">与 LayerNorm 对比（均值/标准差）</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs overflow-auto">
                    <table className="border-collapse">
                      <thead>
                        <tr className="bg-amber-100">
                          <th className="p-1 border border-amber-200">token</th>
                          <th className="p-1 border border-amber-200">LN 均值 μ</th>
                          <th className="p-1 border border-amber-200">LN 标准差 σ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ln_mean.map((m, i) => (
                          <tr key={i}>
                            <td className="p-1 border border-amber-200 font-mono">{i}</td>
                            <td className="p-1 border border-amber-200 text-center font-mono">{fmt(m, 3)}</td>
                            <td className="p-1 border border-amber-200 text-center font-mono">{ln_std[i] !== undefined ? fmt(ln_std[i], 3) : "--"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="col-span-2 text-amber-700 text-xs self-center">
                      <p>RMSNorm 假设 μ ≈ 0，省去计算均值的步骤</p>
                      <p className="mt-1">实验表明：对于绝大多数 token，均值确实接近 0</p>
                      <p className="text-amber-600 mt-1 font-medium">计算量节省 ≈ 20%（与 d_model 成正比）</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Formula */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">核心公式</h4>
                <div className="space-y-3 text-sm text-blue-900">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">RMS 计算</div>
                    <BlockMath math="\text{RMS}(\mathbf{x}) = \sqrt{\frac{1}{d} \sum_{i=1}^{d} x_i^2 + \varepsilon}" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">RMSNorm</div>
                    <BlockMath math="\text{RMSNorm}(\mathbf{x}) = \frac{\mathbf{x}}{\text{RMS}(\mathbf{x})} \odot \boldsymbol{\gamma}" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">与 LayerNorm 对比</div>
                    <BlockMath math="\text{LayerNorm}: \frac{\mathbf{x} - \mu}{\sigma} \odot \boldsymbol{\gamma} + \boldsymbol{\beta} \quad \text{（多了 } \mu, \beta \text{ 计算）}" />
                  </div>
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default RMSNormVisualizer;

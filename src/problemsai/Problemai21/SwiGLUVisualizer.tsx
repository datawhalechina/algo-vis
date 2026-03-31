import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateSwiGLUSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

const PROBLEM_ID = 10021;

interface SwiGLUInput extends ProblemInput {
  seqLen: number;
  dModel: number;
  dFf: number;
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
function MatrixGrid({ matrix, label, maxCols = 6 }: MatrixGridProps) {
  const rows = matrix.length;
  const cols = Math.min(matrix[0]?.length ?? 0, maxCols);
  const allVals = matrix.flatMap((r) => r.slice(0, cols));
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);

  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">
        {label}
        <span className="font-normal text-gray-400 ml-1">[{rows}×{matrix[0]?.length ?? 0}]
          {(matrix[0]?.length ?? 0) > maxCols && <span className="text-amber-500 ml-1">（前{maxCols}列）</span>}
        </span>
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
  { key: "gate_proj", label: "门控投影" },
  { key: "up_proj", label: "值投影" },
  { key: "swish_gate", label: "Swish 激活" },
  { key: "gated_product", label: "门控乘积" },
  { key: "done", label: "输出投影" },
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
              <div className={`px-2 py-1 rounded whitespace-nowrap ${isActive ? "bg-orange-500 text-white font-semibold" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                {s.label}
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className={`w-2.5 h-0.5 mx-0.5 ${isDone || isActive ? "bg-orange-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SwiGLUVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<SwiGLUInput, Record<string, never>>
      config={{
        defaultInput: { seqLen: 3, dModel: 4, dFf: 8 },

        algorithm: (input) => {
          const seqLen = Math.max(2, Math.min(5, input.seqLen ?? 3));
          const dModel = Math.max(2, Math.min(8, input.dModel ?? 4));
          const dFf = Math.max(4, Math.min(16, input.dFf ?? 8));
          return generateSwiGLUSteps(seqLen, dModel, dFf);
        },

        inputTypes: [
          { type: "number", key: "seqLen", label: "序列长度" },
          { type: "number", key: "dModel", label: "输入维度" },
          { type: "number", key: "dFf", label: "FFN 维度" },
        ],
        inputFields: [
          { type: "number", key: "seqLen", label: "序列长度 seq_len", placeholder: "3" },
          { type: "number", key: "dModel", label: "输入维度 d_model", placeholder: "4" },
          { type: "number", key: "dFf", label: "FFN 维度 d_ff", placeholder: "8" },
        ],
        testCases: [
          { label: "默认（3×4→8）", value: { seqLen: 3, dModel: 4, dFf: 8 } },
          { label: "更大维度（3×4→16）", value: { seqLen: 3, dModel: 4, dFf: 16 } },
          { label: "更多 token（5×4→8）", value: { seqLen: 5, dModel: 4, dFf: 8 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const X = variables?.X as number[][] | undefined;
          const gateLinear = variables?.gateLinear as number[][] | undefined;
          const upLinear = variables?.upLinear as number[][] | undefined;
          const gateSwish = variables?.gateSwish as number[][] | undefined;
          const gatedProduct = variables?.gatedProduct as number[][] | undefined;
          const output = variables?.output as number[][] | undefined;
          const swishCurve = variables?.swishCurve as { x: number; relu: number; swish: number }[] | undefined;
          const seqLen = (variables?.seqLen as number) ?? 3;
          const dModel = (variables?.dModel as number) ?? 4;
          const dFf = (variables?.dFf as number) ?? 8;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">SwiGLU 激活函数</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  seq_len={seqLen} · d_model={dModel} · d_ff={dFf}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <PipelineBar phase={phase} />
              </div>

              {/* Architecture comparison */}
              <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                <h4 className="text-sm font-semibold text-orange-800 mb-3">FFN 变体对比</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="font-semibold text-gray-700 mb-1">标准 FFN（ReLU）</div>
                    <div className="font-mono text-gray-600">ReLU(xW₁)W₂</div>
                    <div className="text-gray-500 mt-1">2 个权重矩阵</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="font-semibold text-gray-700 mb-1">FFN（GELU）</div>
                    <div className="font-mono text-gray-600">GELU(xW₁)W₂</div>
                    <div className="text-gray-500 mt-1">2 个权重矩阵</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-orange-200">
                    <div className="font-semibold text-orange-700 mb-1">SwiGLU ★</div>
                    <div className="font-mono text-orange-600">Swish(xW_g)⊙(xW_u)W_d</div>
                    <div className="text-orange-500 mt-1">3 个权重矩阵</div>
                  </div>
                </div>
              </div>

              {/* SwiGLU data flow */}
              <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                <h4 className="text-sm font-semibold text-orange-800 mb-3">SwiGLU 数据流</h4>
                <div className="flex flex-col items-center gap-1 text-xs">
                  {[
                    { label: "输入 X", color: "bg-gray-100 text-gray-700", active: phase === "init" },
                    { label: "（并行）门控投影 xW_gate  |  值投影 xW_up", color: "bg-blue-100 text-blue-700", active: ["gate_proj","up_proj"].includes(phase) },
                    { label: "Swish(gate) = gate × σ(gate)", color: "bg-amber-100 text-amber-700", active: phase === "swish_gate" },
                    { label: "gate_swish ⊙ up（逐元素乘）", color: "bg-orange-100 text-orange-700", active: phase === "gated_product" },
                    { label: "输出投影 × W_down", color: "bg-emerald-100 text-emerald-700", active: phase === "done" },
                  ].map((node, idx, arr) => (
                    <div key={idx} className="flex flex-col items-center w-full max-w-sm">
                      <div className={`w-full text-center px-3 py-2 rounded border font-medium text-xs ${node.color} ${node.active ? "ring-2 ring-orange-400 shadow" : "opacity-70"}`}>
                        {node.label}
                      </div>
                      {idx < arr.length - 1 && <div className="w-0.5 h-3 bg-gray-400" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Swish activation curve */}
              {swishCurve && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Swish vs ReLU 激活曲线
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-1 border border-gray-200 text-center">x</th>
                          {swishCurve.filter((_, i) => i % 2 === 0).map((d) => (
                            <th key={d.x} className="p-1 border border-gray-200 text-center font-mono w-10">{d.x}</th>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-1 border border-gray-200 font-medium text-red-600">ReLU</td>
                          {swishCurve.filter((_, i) => i % 2 === 0).map((d) => (
                            <td key={d.x} className="p-1 border border-gray-200 text-center font-mono" style={{ backgroundColor: `rgba(239,68,68,${Math.abs(d.relu) * 0.3})` }}>{d.relu.toFixed(1)}</td>
                          ))}
                        </tr>
                        <tr>
                          <td className="p-1 border border-gray-200 font-medium text-orange-600">Swish</td>
                          {swishCurve.filter((_, i) => i % 2 === 0).map((d) => (
                            <td key={d.x} className="p-1 border border-gray-200 text-center font-mono" style={{ backgroundColor: `rgba(249,115,22,${Math.abs(d.swish) * 0.3})` }}>{d.swish.toFixed(2)}</td>
                          ))}
                        </tr>
                      </thead>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Swish 在负数区域有小梯度（不像 ReLU 完全为0），避免"死神经元"问题
                  </p>
                </div>
              )}

              {/* Matrix visualizations */}
              {X && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <MatrixGrid matrix={X} label="输入 X" />
                </div>
              )}

              {gateLinear && upLinear && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    并行投影（扩展至 d_ff={dFf}）
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <MatrixGrid matrix={gateLinear} label="门控分支 xW_gate（待 Swish）" maxCols={6} />
                    <MatrixGrid matrix={upLinear} label="值分支 xW_up（待门控）" maxCols={6} />
                  </div>
                </div>
              )}

              {gateSwish && upLinear && (
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                  <h4 className="text-sm font-semibold text-amber-800 mb-3">
                    Swish 激活后的门控值&nbsp;
                    <span className="font-normal text-xs text-amber-600">
                      <InlineMath math="\text{Swish}(x) = x \cdot \sigma(x) = \frac{x}{1+e^{-x}}" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={gateSwish} label="gate_swish（门控权重）" maxCols={6} />
                  <p className="text-xs text-amber-700 mt-2">值域接近 [0, 1] 的维度将充当"门"，控制对应维度信息的传递量</p>
                </div>
              )}

              {gatedProduct && (
                <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                  <h4 className="text-sm font-semibold text-orange-800 mb-2">
                    门控乘积 gate_swish ⊙ up&nbsp;
                    <span className="font-normal text-xs text-orange-600">逐元素相乘</span>
                  </h4>
                  <MatrixGrid matrix={gatedProduct} label="gated_product（信息过滤后）" maxCols={6} />
                </div>
              )}

              {output && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    最终输出 gated × W_down
                  </h4>
                  <MatrixGrid matrix={output} label={`output [${seqLen}×${dModel}]（压缩回 d_model）`} />
                </div>
              )}

              {/* Formula */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">SwiGLU 核心公式</h4>
                <div className="space-y-3 text-sm text-blue-900">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">Swish / SiLU 激活</div>
                    <BlockMath math="\text{Swish}(x) = x \cdot \sigma(x) = \frac{x}{1 + e^{-x}}" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">SwiGLU FFN</div>
                    <BlockMath math="\text{SwiGLU}(x, W_g, W_u, W_d) = \left(\text{Swish}(xW_g) \odot xW_u\right) W_d" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">LLaMA 中的参数量（与标准 FFN 相等）</div>
                    <BlockMath math="d_{ff} = \frac{8}{3} \cdot d_{model}" />
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

export default SwiGLUVisualizer;

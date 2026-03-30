import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateTransformerEncoderSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

const PROBLEM_ID = 10016;

interface TransformerEncoderInput extends ProblemInput {
  seqLen: number;
  dModel: number;
  numHeads: number;
  dFf: number;
}

// ── 颜色工具 ──────────────────────────────────────────────────────────
function heatColor(v: number, min: number, max: number): string {
  const ratio = max === min ? 0.5 : (v - min) / (max - min);
  const hue = Math.round((1 - ratio) * 240); // 240=蓝, 0=红
  return `hsl(${hue}, 70%, 85%)`;
}

function fmt(v: number, d = 3): string {
  return Number.isFinite(v) ? v.toFixed(d) : "--";
}

// ── 矩阵展示组件 ──────────────────────────────────────────────────────
interface MatrixGridProps {
  matrix: number[][];
  label: string;
  highlightRow?: number;
  highlightCol?: number;
  maxCols?: number;
}
function MatrixGrid({ matrix, label, highlightRow, highlightCol, maxCols = 6 }: MatrixGridProps) {
  const rows = matrix.length;
  const cols = Math.min(matrix[0]?.length ?? 0, maxCols);
  const allVals = matrix.flatMap((r) => r.slice(0, cols));
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const truncated = (matrix[0]?.length ?? 0) > maxCols;

  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">
        {label}
        <span className="font-normal text-gray-400 ml-1">
          [{rows}×{matrix[0]?.length ?? 0}]
          {truncated && <span className="text-amber-500 ml-1">（前 {maxCols} 列）</span>}
        </span>
      </div>
      <div className="overflow-auto">
        <table className="border-collapse text-xs font-mono">
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                {row.slice(0, cols).map((v, j) => {
                  const isHR = highlightRow === i;
                  const isHC = highlightCol === j;
                  const bg = heatColor(v, minV, maxV);
                  return (
                    <td
                      key={j}
                      className={`w-10 h-7 text-center border border-white rounded ${
                        isHR && isHC
                          ? "ring-2 ring-orange-500"
                          : isHR
                          ? "ring-1 ring-blue-400"
                          : isHC
                          ? "ring-1 ring-purple-400"
                          : ""
                      }`}
                      style={{ backgroundColor: bg }}
                    >
                      {fmt(v, 2)}
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

// ── 流程步骤条 ────────────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { key: "init", label: "输入 X" },
  { key: "qkv_proj", label: "QKV 投影" },
  { key: "head_split", label: "多头切分" },
  { key: "scores", label: "注意力分数" },
  { key: "softmax", label: "Softmax" },
  { key: "attn_output", label: "注意力输出" },
  { key: "attn_residual", label: "Add & Norm₁" },
  { key: "ffn_hidden", label: "FFN 隐层" },
  { key: "ffn_out", label: "FFN 输出" },
  { key: "ffn_residual", label: "Add & Norm₂" },
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
              <div
                className={`px-2 py-1 rounded whitespace-nowrap ${
                  isActive
                    ? "bg-blue-500 text-white font-semibold"
                    : isDone
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {s.label}
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div
                  className={`w-2.5 h-0.5 mx-0.5 ${
                    isDone || isActive ? "bg-blue-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 阶段 badge ────────────────────────────────────────────────────────
const PHASE_STYLE: Record<string, string> = {
  init: "bg-gray-100 text-gray-600",
  qkv_proj: "bg-blue-100 text-blue-700",
  head_split: "bg-indigo-100 text-indigo-700",
  scores: "bg-amber-100 text-amber-700",
  softmax: "bg-orange-100 text-orange-700",
  attn_output: "bg-purple-100 text-purple-700",
  attn_residual: "bg-teal-100 text-teal-700",
  ffn_hidden: "bg-rose-100 text-rose-700",
  ffn_out: "bg-pink-100 text-pink-700",
  ffn_residual: "bg-cyan-100 text-cyan-700",
  done: "bg-emerald-100 text-emerald-700",
};
const PHASE_LABEL: Record<string, string> = {
  init: "输入初始化",
  qkv_proj: "QKV 投影",
  head_split: "多头切分",
  scores: "注意力分数",
  softmax: "Softmax",
  attn_output: "注意力输出",
  attn_residual: "Add & Norm₁",
  ffn_hidden: "FFN 隐层",
  ffn_out: "FFN 输出",
  ffn_residual: "Add & Norm₂",
  done: "完成",
};

// ── 主可视化组件 ──────────────────────────────────────────────────────
function TransformerEncoderVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<TransformerEncoderInput, Record<string, never>>
      config={{
        defaultInput: { seqLen: 4, dModel: 8, numHeads: 2, dFf: 16 },

        algorithm: (input) => {
          const seqLen = Math.max(2, Math.min(6, input.seqLen ?? 4));
          const dModel = Math.max(4, Math.min(16, input.dModel ?? 8));
          const numHeads = Math.max(1, Math.min(4, input.numHeads ?? 2));
          const dFf = Math.max(4, Math.min(32, input.dFf ?? 16));
          return generateTransformerEncoderSteps(seqLen, dModel, numHeads, dFf);
        },

        inputTypes: [
          { type: "number", key: "seqLen", label: "序列长度" },
          { type: "number", key: "dModel", label: "嵌入维度" },
          { type: "number", key: "numHeads", label: "注意力头数" },
          { type: "number", key: "dFf", label: "FFN 维度" },
        ],
        inputFields: [
          { type: "number", key: "seqLen", label: "序列长度 seq_len", placeholder: "4" },
          { type: "number", key: "dModel", label: "嵌入维度 d_model", placeholder: "8" },
          { type: "number", key: "numHeads", label: "注意力头数 num_heads", placeholder: "2" },
          { type: "number", key: "dFf", label: "FFN 维度 d_ff", placeholder: "16" },
        ],
        testCases: [
          { label: "默认（4tok/8d）", value: { seqLen: 4, dModel: 8, numHeads: 2, dFf: 16 } },
          { label: "小序列（3tok）", value: { seqLen: 3, dModel: 8, numHeads: 2, dFf: 16 } },
          { label: "4头注意力", value: { seqLen: 4, dModel: 8, numHeads: 4, dFf: 16 } },
          { label: "大维度（6tok/16d）", value: { seqLen: 6, dModel: 16, numHeads: 4, dFf: 32 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const X = variables?.X as number[][] | undefined;
          const Q1 = variables?.Q1 as number[][] | undefined;
          const K1 = variables?.K1 as number[][] | undefined;
          const V1 = variables?.V1 as number[][] | undefined;
          const scores = variables?.scores as number[][] | undefined;
          const attnWeights = variables?.attnWeights as number[][] | undefined;
          const attnOut = variables?.attnOut as number[][] | undefined;
          const attnResidual = variables?.attnResidual as number[][] | undefined;
          const ffnHidden = variables?.ffnHidden as number[][] | undefined;
          const ffnOut = variables?.ffnOut as number[][] | undefined;
          const finalOut = variables?.finalOut as number[][] | undefined;
          const seqLen = (variables?.seqLen as number) ?? 4;
          const dModel = (variables?.dModel as number) ?? 8;
          const numHeads = (variables?.numHeads as number) ?? 2;
          const dFf = (variables?.dFf as number) ?? 16;
          const dK = (variables?.dK as number) ?? 4;

          return (
            <div className="space-y-4">
              {/* 核心思想 */}
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题卡 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Transformer Encoder 层
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      seq_len={seqLen} · d_model={dModel} · heads={numHeads} · d_ff={dFf} · d_k={dK}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${PHASE_STYLE[phase] ?? "bg-gray-100 text-gray-600"}`}>
                    {PHASE_LABEL[phase] ?? phase}
                  </span>
                </div>
              </div>

              {/* 流程进度条 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <PipelineBar phase={phase} />
              </div>

              {/* Encoder 架构示意 */}
              <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                <h4 className="text-sm font-semibold text-purple-800 mb-2">Encoder 层结构</h4>
                <div className="flex flex-col items-center gap-1 text-xs">
                  {[
                    { key: "input", label: "输入 X", color: "bg-gray-200 text-gray-700", active: phase === "init" || phase === "qkv_proj" || phase === "head_split" },
                    { key: "mhsa", label: "多头自注意力（MHSA）", color: "bg-blue-100 text-blue-700", active: ["scores","softmax","attn_output"].includes(phase) },
                    { key: "add1", label: "Add & Norm（残差 + LayerNorm）", color: "bg-teal-100 text-teal-700", active: phase === "attn_residual" },
                    { key: "ffn", label: "前馈网络（FFN）：Linear → ReLU → Linear", color: "bg-rose-100 text-rose-700", active: ["ffn_hidden","ffn_out"].includes(phase) },
                    { key: "add2", label: "Add & Norm（残差 + LayerNorm）", color: "bg-cyan-100 text-cyan-700", active: phase === "ffn_residual" || phase === "done" },
                    { key: "output", label: "输出（形状同输入）", color: "bg-emerald-100 text-emerald-700", active: phase === "done" },
                  ].map((node, idx, arr) => (
                    <div key={node.key} className="flex flex-col items-center w-full max-w-xs">
                      <div
                        className={`w-full text-center px-3 py-2 rounded border font-medium transition-all ${node.color} ${node.active ? "ring-2 ring-offset-1 ring-blue-400 shadow" : "opacity-70"}`}
                      >
                        {node.label}
                      </div>
                      {idx < arr.length - 1 && (
                        <div className="w-0.5 h-3 bg-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 输入矩阵 */}
              {X && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <MatrixGrid matrix={X} label="输入矩阵 X" />
                </div>
              )}

              {/* QKV 投影 */}
              {(Q1 || K1 || V1) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    第 1 头 Q / K / V（维度 d_k = {dK}）
                  </h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    {Q1 && <MatrixGrid matrix={Q1} label="Q" />}
                    {K1 && <MatrixGrid matrix={K1} label="K" />}
                    {V1 && <MatrixGrid matrix={V1} label="V" />}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <InlineMath math="Q = XW_Q,\quad K = XW_K,\quad V = XW_V" />
                  </div>
                </div>
              )}

              {/* 注意力分数 */}
              {scores && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    原始注意力分数&nbsp;
                    <span className="font-normal text-gray-500 text-xs">
                      <InlineMath math={`QK^T / \\sqrt{d_k}`} />
                    </span>
                  </h4>
                  <MatrixGrid matrix={scores} label={`分数矩阵 [${seqLen}×${seqLen}]`} />
                  <div className="mt-2 text-xs text-gray-500">
                    <InlineMath math={`\\text{scale} = \\sqrt{${dK}} \\approx ${Math.sqrt(dK).toFixed(2)}`} />
                  </div>
                </div>
              )}

              {/* 注意力权重热力图 */}
              {attnWeights && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    注意力权重矩阵（Softmax）&nbsp;
                    <span className="font-normal text-gray-500 text-xs">
                      <InlineMath math="\text{softmax}(QK^T/\sqrt{d_k})" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={attnWeights} label={`权重 [${seqLen}×${seqLen}]，每行和 = 1`} />
                  <div className="mt-2 flex gap-3 text-xs text-blue-600">
                    <span className="inline-block w-4 h-4 rounded" style={{ background: "hsl(240,70%,85%)" }} />
                    <span>低权重</span>
                    <span className="inline-block w-4 h-4 rounded" style={{ background: "hsl(0,70%,85%)" }} />
                    <span>高权重</span>
                  </div>
                </div>
              )}

              {/* 注意力输出 */}
              {attnOut && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    注意力输出&nbsp;
                    <span className="font-normal text-xs text-gray-500">
                      <InlineMath math="\text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}\right)V" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={attnOut} label={`attnOut [${seqLen}×${dModel}]`} />
                </div>
              )}

              {/* 注意力残差 + LayerNorm */}
              {attnResidual && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    Add & Norm₁（注意力子层后）&nbsp;
                    <span className="font-normal text-xs text-gray-500">
                      <InlineMath math="\text{LayerNorm}(X + \text{attnOut})" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={attnResidual} label={`attnResidual [${seqLen}×${dModel}]`} />
                </div>
              )}

              {/* FFN 隐层 */}
              {ffnHidden && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    FFN 隐层（ReLU 激活）&nbsp;
                    <span className="font-normal text-xs text-gray-500">
                      <InlineMath math="\text{ReLU}(XW_1 + b_1)" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={ffnHidden} label={`ffnHidden [${seqLen}×${dFf}]`} />
                </div>
              )}

              {/* FFN 输出 */}
              {ffnOut && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    FFN 输出&nbsp;
                    <span className="font-normal text-xs text-gray-500">
                      <InlineMath math="XW_2 + b_2" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={ffnOut} label={`ffnOut [${seqLen}×${dModel}]`} />
                </div>
              )}

              {/* 最终输出 */}
              {finalOut && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    Encoder 层输出（Add & Norm₂）&nbsp;
                    <span className="font-normal text-xs text-emerald-600">
                      <InlineMath math="\text{LayerNorm}(\text{attnResidual} + \text{ffnOut})" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={finalOut} label={`finalOut [${seqLen}×${dModel}]`} />
                  <p className="text-xs text-emerald-700 mt-2">
                    输出形状与输入相同，可直接输入下一个 Encoder 层。
                  </p>
                </div>
              )}

              {/* 公式参考 */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">核心公式</h4>
                <div className="space-y-3 text-blue-900 text-sm">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">缩放点积注意力</div>
                    <BlockMath math="\text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}}\right)V" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">多头注意力</div>
                    <BlockMath math="\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1,\ldots,\text{head}_h)W^O" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">前馈网络</div>
                    <BlockMath math="\text{FFN}(x) = \text{ReLU}(xW_1 + b_1)W_2 + b_2" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">Encoder 层（Post-LN）</div>
                    <BlockMath math="\begin{aligned} x' &= \text{LayerNorm}(x + \text{MHSA}(x)) \\ \text{out} &= \text{LayerNorm}(x' + \text{FFN}(x')) \end{aligned}" />
                  </div>
                </div>
              </div>

              {/* Pre-LN vs Post-LN 对比 */}
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">Pre-LN vs Post-LN</h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-amber-800">
                  <div className="bg-white rounded p-2 border border-amber-100">
                    <div className="font-semibold mb-1">Post-LN（原始论文）</div>
                    <InlineMath math="x' = \text{LN}(x + \text{Sub}(x))" />
                    <div className="text-amber-600 mt-1">训练不稳定，需 Warmup</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-amber-100">
                    <div className="font-semibold mb-1">Pre-LN（现代常用）</div>
                    <InlineMath math="x' = x + \text{Sub}(\text{LN}(x))" />
                    <div className="text-amber-600 mt-1">训练更稳定，GPT/LLaMA 采用</div>
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

export default TransformerEncoderVisualizer;

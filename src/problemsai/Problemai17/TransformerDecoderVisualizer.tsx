import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateTransformerDecoderSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

const PROBLEM_ID = 10017;

interface DecoderInput extends ProblemInput {
  decSeqLen: number;
  encSeqLen: number;
  dModel: number;
  numHeads: number;
  dFf: number;
}

function heatColor(v: number, min: number, max: number): string {
  const ratio = max === min ? 0.5 : (v - min) / (max - min);
  const hue = Math.round((1 - ratio) * 240);
  return `hsl(${hue}, 70%, 85%)`;
}

function fmt(v: number, d = 2): string {
  return Number.isFinite(v) ? v.toFixed(d) : "--";
}

interface MatrixGridProps {
  matrix: number[][];
  label: string;
  maxCols?: number;
  highlightDiag?: boolean;
}
function MatrixGrid({ matrix, label, maxCols = 6, highlightDiag = false }: MatrixGridProps) {
  const rows = matrix.length;
  const cols = Math.min(matrix[0]?.length ?? 0, maxCols);
  const allVals = matrix.flatMap((r) => r.slice(0, cols));
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);

  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">
        {label}
        <span className="font-normal text-gray-400 ml-1">
          [{rows}×{matrix[0]?.length ?? 0}]
          {(matrix[0]?.length ?? 0) > maxCols && (
            <span className="text-amber-500 ml-1">（前 {maxCols} 列）</span>
          )}
        </span>
      </div>
      <table className="border-collapse text-xs font-mono">
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.slice(0, cols).map((v, j) => {
                const isDiag = highlightDiag && i === j;
                const isMasked = highlightDiag && j > i;
                return (
                  <td
                    key={j}
                    className={`w-10 h-7 text-center border border-white rounded ${isDiag ? "ring-2 ring-blue-500" : ""}`}
                    style={{
                      backgroundColor: isMasked ? "#e5e7eb" : heatColor(v, minV, maxV),
                      opacity: isMasked ? 0.4 : 1,
                    }}
                  >
                    {isMasked ? "×" : fmt(v, 2)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PIPELINE_STEPS = [
  { key: "init", label: "输入" },
  { key: "masked_self_attn", label: "掩码自注意力" },
  { key: "add_norm_1", label: "Add & Norm₁" },
  { key: "cross_attn", label: "交叉注意力" },
  { key: "add_norm_2", label: "Add & Norm₂" },
  { key: "ffn_hidden", label: "FFN 扩展" },
  { key: "ffn_out", label: "FFN 压缩" },
  { key: "done", label: "输出" },
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
                  isActive ? "bg-purple-500 text-white font-semibold"
                    : isDone ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {s.label}
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className={`w-2.5 h-0.5 mx-0.5 ${isDone || isActive ? "bg-purple-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TransformerDecoderVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<DecoderInput, Record<string, never>>
      config={{
        defaultInput: { decSeqLen: 3, encSeqLen: 4, dModel: 8, numHeads: 2, dFf: 16 },

        algorithm: (input) => {
          const decSeqLen = Math.max(2, Math.min(5, input.decSeqLen ?? 3));
          const encSeqLen = Math.max(2, Math.min(5, input.encSeqLen ?? 4));
          const dModel = Math.max(4, Math.min(16, input.dModel ?? 8));
          const numHeads = Math.max(1, Math.min(4, input.numHeads ?? 2));
          const dFf = Math.max(4, Math.min(32, input.dFf ?? 16));
          return generateTransformerDecoderSteps(decSeqLen, encSeqLen, dModel, numHeads, dFf);
        },

        inputTypes: [
          { type: "number", key: "decSeqLen", label: "Decoder 序列长度" },
          { type: "number", key: "encSeqLen", label: "Encoder 序列长度" },
          { type: "number", key: "dModel", label: "嵌入维度" },
          { type: "number", key: "numHeads", label: "注意力头数" },
          { type: "number", key: "dFf", label: "FFN 维度" },
        ],
        inputFields: [
          { type: "number", key: "decSeqLen", label: "Decoder 序列长度", placeholder: "3" },
          { type: "number", key: "encSeqLen", label: "Encoder 序列长度", placeholder: "4" },
          { type: "number", key: "dModel", label: "嵌入维度 d_model", placeholder: "8" },
          { type: "number", key: "numHeads", label: "注意力头数", placeholder: "2" },
          { type: "number", key: "dFf", label: "FFN 维度 d_ff", placeholder: "16" },
        ],
        testCases: [
          { label: "默认（3dec/4enc）", value: { decSeqLen: 3, encSeqLen: 4, dModel: 8, numHeads: 2, dFf: 16 } },
          { label: "等长序列", value: { decSeqLen: 4, encSeqLen: 4, dModel: 8, numHeads: 2, dFf: 16 } },
          { label: "长 Encoder", value: { decSeqLen: 3, encSeqLen: 5, dModel: 8, numHeads: 2, dFf: 16 } },
          { label: "4 头", value: { decSeqLen: 3, encSeqLen: 4, dModel: 8, numHeads: 4, dFf: 16 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const X_dec = variables?.X_dec as number[][] | undefined;
          const enc_out = variables?.enc_out as number[][] | undefined;
          const maskedAttnW = variables?.maskedAttnW as number[][] | undefined;
          const crossAttnW = variables?.crossAttnW as number[][] | undefined;
          const decNorm2 = variables?.decNorm2 as number[][] | undefined;
          const ffnHidden = variables?.ffnHidden as number[][] | undefined;
          const finalOut = variables?.finalOut as number[][] | undefined;
          const causalMask = variables?.causalMask as number[][] | undefined;
          const decSeqLen = (variables?.decSeqLen as number) ?? 3;
          const encSeqLen = (variables?.encSeqLen as number) ?? 4;
          const dModel = (variables?.dModel as number) ?? 8;
          const numHeads = (variables?.numHeads as number) ?? 2;
          const dFf = (variables?.dFf as number) ?? 16;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">Transformer Decoder 层</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  dec_len={decSeqLen} · enc_len={encSeqLen} · d_model={dModel} · heads={numHeads} · d_ff={dFf}
                </p>
              </div>

              {/* Pipeline */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <PipelineBar phase={phase} />
              </div>

              {/* Decoder Architecture */}
              <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
                <h4 className="text-sm font-semibold text-purple-800 mb-2">Decoder 层结构（3个子层）</h4>
                <div className="flex flex-col items-center gap-1 text-xs">
                  {[
                    { key: "enc", label: "Encoder 输出 enc_out（提供 K、V）", color: "bg-blue-100 text-blue-700", side: true, active: phase === "cross_attn" },
                    { key: "input", label: "Decoder 输入 X_dec", color: "bg-gray-200 text-gray-700", active: phase === "init" },
                    { key: "masked", label: "① 掩码多头自注意力（Causal）", color: "bg-rose-100 text-rose-700", active: phase === "masked_self_attn" },
                    { key: "add1", label: "Add & Norm₁", color: "bg-teal-100 text-teal-700", active: phase === "add_norm_1" },
                    { key: "cross", label: "② 交叉注意力（Q←Decoder，K/V←Encoder）", color: "bg-amber-100 text-amber-700", active: phase === "cross_attn" },
                    { key: "add2", label: "Add & Norm₂", color: "bg-teal-100 text-teal-700", active: phase === "add_norm_2" },
                    { key: "ffn", label: "③ 前馈网络（FFN）", color: "bg-indigo-100 text-indigo-700", active: ["ffn_hidden", "ffn_out"].includes(phase) },
                    { key: "add3", label: "Add & Norm₃ (输出)", color: "bg-emerald-100 text-emerald-700", active: phase === "done" },
                  ].filter(n => !n.side).map((node, idx, arr) => (
                    <div key={node.key} className="flex flex-col items-center w-full max-w-xs">
                      <div className={`w-full text-center px-3 py-2 rounded border font-medium text-xs transition-all ${node.color} ${node.active ? "ring-2 ring-offset-1 ring-purple-400 shadow" : "opacity-70"}`}>
                        {node.label}
                      </div>
                      {idx < arr.length - 1 && <div className="w-0.5 h-3 bg-gray-400" />}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-purple-600 bg-blue-50 rounded p-2">
                  Encoder 输出（蓝色框）→ 交叉注意力层提供 K、V
                </div>
              </div>

              {/* Key difference from Encoder */}
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-3">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">与 Encoder 的核心区别</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded p-2 border border-amber-100">
                    <div className="font-semibold text-blue-700 mb-1">Encoder（双向）</div>
                    <div className="text-gray-600">自注意力无掩码</div>
                    <div className="text-gray-600">每位置看全序列</div>
                    <div className="text-gray-500 mt-1">用于 BERT 等理解任务</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-amber-100">
                    <div className="font-semibold text-purple-700 mb-1">Decoder（因果）</div>
                    <div className="text-gray-600">自注意力 + 因果掩码</div>
                    <div className="text-gray-600">只看当前及过去</div>
                    <div className="text-gray-500 mt-1">用于 GPT 等生成任务</div>
                  </div>
                </div>
              </div>

              {/* Inputs */}
              {X_dec && enc_out && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">输入矩阵</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <MatrixGrid matrix={X_dec} label="Decoder 输入 X_dec" />
                    <MatrixGrid matrix={enc_out} label="Encoder 输出 enc_out" />
                  </div>
                </div>
              )}

              {/* Causal Mask */}
              {causalMask && (
                <div className="bg-rose-50 rounded-lg border border-rose-200 p-4">
                  <h4 className="text-sm font-semibold text-rose-800 mb-2">
                    因果掩码矩阵&nbsp;
                    <span className="font-normal text-xs text-rose-600">
                      <InlineMath math="\text{mask}[i,j] = \begin{cases} 0 & j \leq i \\ -\infty & j > i \end{cases}" />
                    </span>
                  </h4>
                  <div className="overflow-auto">
                    <table className="border-collapse text-xs font-mono">
                      <tbody>
                        {causalMask.map((row, i) => (
                          <tr key={i}>
                            {row.map((_, j) => (
                              <td key={j} className={`w-10 h-7 text-center border border-white rounded text-xs ${j > i ? "bg-gray-200 text-gray-400" : "bg-rose-100 text-rose-800 font-medium"}`}>
                                {j > i ? "-∞" : "0"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-rose-600 mt-2">下三角为 0（可见），上三角为 -∞（屏蔽未来位置）</p>
                </div>
              )}

              {/* Masked Self-Attention Weights */}
              {maskedAttnW && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    掩码自注意力权重&nbsp;
                    <span className="font-normal text-xs text-gray-500">
                      <InlineMath math="\text{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}} + \text{mask}\right)" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={maskedAttnW} label="掩码注意力权重（上三角为0）" />
                </div>
              )}

              {/* Cross-Attention Weights */}
              {crossAttnW && (
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">
                    交叉注意力权重&nbsp;
                    <span className="font-normal text-xs text-amber-600">
                      <InlineMath math="Q \text{(Decoder)} \times K^T \text{(Encoder)}" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={crossAttnW} label={`交叉注意力 [${decSeqLen}×${encSeqLen}]`} />
                  <p className="text-xs text-amber-700 mt-2">行 = Decoder 位置，列 = Encoder 位置，每行显示该 Decoder token 关注哪些 Encoder token</p>
                </div>
              )}

              {/* Intermediate outputs */}
              {decNorm2 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    Add & Norm₂ 后&nbsp;
                    <span className="font-normal text-xs text-gray-500">已融合 Encoder 上下文</span>
                  </h4>
                  <MatrixGrid matrix={decNorm2} label={`decNorm2 [${decSeqLen}×${dModel}]`} />
                </div>
              )}

              {/* FFN */}
              {ffnHidden && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    FFN 隐层&nbsp;
                    <span className="font-normal text-xs text-gray-500">
                      <InlineMath math="\text{ReLU}(xW_1) \in \mathbb{R}^{N \times d_{ff}}" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={ffnHidden} label={`ffnHidden [${decSeqLen}×${dFf}]`} />
                </div>
              )}

              {/* Final output */}
              {finalOut && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    Decoder 层输出（Add & Norm₃）
                  </h4>
                  <MatrixGrid matrix={finalOut} label={`output [${decSeqLen}×${dModel}]`} />
                  <p className="text-xs text-emerald-700 mt-2">
                    可输入下一个 Decoder 层，或经 Linear + Softmax 得到 token 概率分布。
                  </p>
                </div>
              )}

              {/* Formula Reference */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">核心公式</h4>
                <div className="space-y-3 text-sm text-blue-900">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">① 掩码自注意力</div>
                    <BlockMath math="\text{MaskedAttn}(Q,K,V) = \text{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}} + M\right)V" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">② 交叉注意力（Q 来自 Decoder，KV 来自 Encoder）</div>
                    <BlockMath math="\text{CrossAttn}(Q_{dec},K_{enc},V_{enc}) = \text{softmax}\!\left(\frac{Q_{dec}K_{enc}^T}{\sqrt{d_k}}\right)V_{enc}" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">③ Decoder 层（3 个子层）</div>
                    <BlockMath math="\begin{aligned} x_1 &= \text{LN}(x + \text{MaskedMHSA}(x)) \\ x_2 &= \text{LN}(x_1 + \text{CrossAttn}(x_1, \text{enc})) \\ \text{out} &= \text{LN}(x_2 + \text{FFN}(x_2)) \end{aligned}" />
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

export default TransformerDecoderVisualizer;

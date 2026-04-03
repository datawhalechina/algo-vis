import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateALiBiSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

const PROBLEM_ID = 10025;

interface ALiBiInput extends ProblemInput {
  seqLen: number;
  numHeads: number;
  dHead: number;
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
function MatrixGrid({ matrix, label, maxCols }: MatrixGridProps) {
  const rows = matrix.length;
  const cols = maxCols ? Math.min(matrix[0]?.length ?? 0, maxCols) : (matrix[0]?.length ?? 0);
  const allVals = matrix.flatMap((r) => r.slice(0, cols));
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);

  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">
        {label}
        <span className="font-normal text-gray-400 ml-1">[{rows}×{cols}]</span>
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
  { key: "init", label: "初始化" },
  { key: "slopes", label: "计算斜率" },
  { key: "distance_matrix", label: "距离矩阵" },
  { key: "bias_matrix", label: "偏置矩阵" },
  { key: "biased_scores", label: "添加偏置" },
  { key: "done", label: "外推演示" },
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
              <div className={`px-2 py-1 rounded whitespace-nowrap ${isActive ? "bg-violet-600 text-white font-semibold" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                {s.label}
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className={`w-2.5 h-0.5 mx-0.5 ${isDone || isActive ? "bg-violet-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ALiBiVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<ALiBiInput, Record<string, never>>
      config={{
        defaultInput: { seqLen: 5, numHeads: 4, dHead: 4 },

        algorithm: (input) => {
          const seqLen = Math.max(3, Math.min(8, input.seqLen ?? 5));
          const numHeads = Math.max(1, Math.min(8, input.numHeads ?? 4));
          const dHead = Math.max(2, Math.min(8, input.dHead ?? 4));
          return generateALiBiSteps(seqLen, numHeads, dHead);
        },

        inputTypes: [
          { type: "number", key: "seqLen", label: "序列长度" },
          { type: "number", key: "numHeads", label: "注意力头数" },
          { type: "number", key: "dHead", label: "头维度" },
        ],
        inputFields: [
          { type: "number", key: "seqLen", label: "序列长度 seq_len", placeholder: "5" },
          { type: "number", key: "numHeads", label: "注意力头数", placeholder: "4" },
          { type: "number", key: "dHead", label: "头维度 d_head", placeholder: "4" },
        ],
        testCases: [
          { label: "默认（5seq/4头）", value: { seqLen: 5, numHeads: 4, dHead: 4 } },
          { label: "多头（5seq/8头）", value: { seqLen: 5, numHeads: 8, dHead: 4 } },
          { label: "长序列（8seq/4头）", value: { seqLen: 8, numHeads: 4, dHead: 4 } },
          { label: "少头（6seq/2头）", value: { seqLen: 6, numHeads: 2, dHead: 4 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const rawScores = variables?.rawScores as number[][] | undefined;
          const biasHead0 = variables?.biasHead0 as number[][] | undefined;
          const biasHead1 = variables?.biasHead1 as number[][] | undefined;
          const biasedScores0 = variables?.biasedScores0 as number[][] | undefined;
          const attnWeightsNoBias = variables?.attnWeightsNoBias as number[][] | undefined;
          const attnWeightsWithBias = variables?.attnWeightsWithBias as number[][] | undefined;
          const extraBias = variables?.extraBias as number[][] | undefined;
          const slopes = variables?.slopes as number[] | undefined;
          const seqLen = (variables?.seqLen as number) ?? 5;
          const numHeads = (variables?.numHeads as number) ?? 4;
          const dHead = (variables?.dHead as number) ?? 4;
          const extraLen = (variables?.extraLen as number) ?? seqLen + 2;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">ALiBi 位置偏置</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  seq_len={seqLen} · num_heads={numHeads} · d_head={dHead}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <PipelineBar phase={phase} />
              </div>

              {/* Position encoding comparison */}
              <div className="bg-violet-50 rounded-lg border border-violet-200 p-4">
                <h4 className="text-sm font-semibold text-violet-800 mb-3">位置编码方法对比</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="font-semibold text-gray-700 mb-1">Sinusoidal PE</div>
                    <div className="text-gray-600">向量加法</div>
                    <div className="text-gray-600">绝对位置</div>
                    <div className="text-gray-400 mt-1">外推差</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="font-semibold text-emerald-700 mb-1">RoPE</div>
                    <div className="text-gray-600">旋转 Q/K</div>
                    <div className="text-gray-600">相对位置</div>
                    <div className="text-emerald-600 mt-1">外推较好</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-violet-200">
                    <div className="font-semibold text-violet-700 mb-1">ALiBi ★</div>
                    <div className="text-gray-600">注意力偏置</div>
                    <div className="text-gray-600">相对位置</div>
                    <div className="text-violet-600 mt-1 font-medium">外推出色</div>
                  </div>
                </div>
              </div>

              {/* Slopes */}
              {slopes && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    每头斜率 m_h&nbsp;
                    <span className="font-normal text-xs text-gray-500">
                      <InlineMath math="m_h = 2^{-8h/H}" />
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {slopes.map((slope, h) => (
                      <div key={h} className="bg-violet-50 border border-violet-200 rounded px-3 py-2 text-xs">
                        <div className="text-violet-700 font-medium">头 {h}</div>
                        <div className="font-mono text-violet-600">m = {slope.toFixed(4)}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    斜率越大 → 惩罚远距离越强 → 更关注近邻；斜率越小 → 可以关注更远位置
                  </p>
                </div>
              )}

              {/* Distance and bias matrices */}
              {biasHead0 && biasHead1 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    位置偏置矩阵（不同头有不同斜率）
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <MatrixGrid matrix={biasHead0} label={`头 0 偏置（m=${slopes ? slopes[0].toFixed(3) : "?"}，斜率大）`} />
                      <p className="text-xs text-gray-500 mt-1">近邻偏置大，关注范围窄</p>
                    </div>
                    <div>
                      <MatrixGrid matrix={biasHead1} label={`头 1 偏置（m=${slopes && slopes[1] ? slopes[1].toFixed(3) : "?"}，斜率小）`} />
                      <p className="text-xs text-gray-500 mt-1">近邻偏置小，关注范围宽</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600 bg-violet-50 rounded p-2">
                    偏置值越负 = 惩罚越大 = 该位置注意力权重越低（蓝色 = 负值大 = 惩罚强）
                  </div>
                </div>
              )}

              {/* Attention comparison: with vs without ALiBi */}
              {attnWeightsNoBias && attnWeightsWithBias && rawScores && biasedScores0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">注意力权重对比（头 0）</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <MatrixGrid matrix={attnWeightsNoBias} label="无 ALiBi（标准注意力权重）" />
                      <p className="text-xs text-gray-500 mt-1">无位置偏置，远近均等</p>
                    </div>
                    <div>
                      <MatrixGrid matrix={attnWeightsWithBias} label="有 ALiBi（添加位置偏置后）" />
                      <p className="text-xs text-violet-600 mt-1">近邻权重更高，位置感知强</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Extrapolation demo */}
              {extraBias && (
                <div className="bg-violet-50 rounded-lg border border-violet-200 p-4">
                  <h4 className="text-sm font-semibold text-violet-800 mb-3">
                    外推演示：从训练长度 {seqLen} 扩展到 {extraLen}
                  </h4>
                  <MatrixGrid matrix={extraBias} label={`头 0 外推偏置 [${extraLen}×${extraLen}]（无需重训练）`} maxCols={Math.min(extraLen, 8)} />
                  <div className="mt-3 text-xs text-violet-700 bg-white rounded p-2 border border-violet-200">
                    <p className="font-semibold mb-1">ALiBi 外推原理：</p>
                    <p>偏置公式 m_h × (-|i-j|) 对任意位置 i, j 都成立，无需修改或微调</p>
                    <p className="mt-1 text-violet-600">BLOOM (176B) 使用 ALiBi，训练长度 2048，推理时支持 更长序列</p>
                  </div>
                </div>
              )}

              {/* Formula */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">ALiBi 核心公式</h4>
                <div className="space-y-3 text-sm text-blue-900">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">头 h 的斜率</div>
                    <BlockMath math="m_h = 2^{-8h/H}, \quad h = 1, 2, \ldots, H" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">位置偏置（头 h 的线性偏置）</div>
                    <BlockMath math="\text{bias}_h[i,j] = m_h \cdot (-|i - j|)" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">ALiBi 注意力</div>
                    <BlockMath math="\text{Attn}_h = \text{softmax}\!\left(\frac{Q_h K_h^T}{\sqrt{d_k}} + \text{bias}_h\right) V_h" />
                  </div>
                  <div className="text-xs text-blue-700 bg-white rounded p-2 border border-blue-200">
                    <strong>关键优势：</strong>不需要位置嵌入参数，公式对任意长度有效，支持零矫正长度外推
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

export default ALiBiVisualizer;

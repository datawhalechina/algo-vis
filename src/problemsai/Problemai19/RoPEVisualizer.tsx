import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateRoPESteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

const PROBLEM_ID = 10019;

interface RoPEInput extends ProblemInput {
  seqLen: number;
  dHead: number;
  base: number;
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
        <span className="font-normal text-gray-400 ml-1">
          [{rows}×{matrix[0]?.length ?? 0}]
          {(matrix[0]?.length ?? 0) > maxCols && <span className="text-amber-500 ml-1">（前 {maxCols} 列）</span>}
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
  { key: "init", label: "初始化" },
  { key: "compute_freqs", label: "计算频率" },
  { key: "angles", label: "位置角度" },
  { key: "rotate_q", label: "旋转 Q" },
  { key: "rotate_k", label: "旋转 K" },
  { key: "attn", label: "计算注意力" },
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
              <div className={`px-2 py-1 rounded whitespace-nowrap ${isActive ? "bg-emerald-600 text-white font-semibold" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                {s.label}
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className={`w-2.5 h-0.5 mx-0.5 ${isDone || isActive ? "bg-emerald-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoPEVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<RoPEInput, Record<string, never>>
      config={{
        defaultInput: { seqLen: 4, dHead: 6, base: 10000 },

        algorithm: (input) => {
          const seqLen = Math.max(2, Math.min(6, input.seqLen ?? 4));
          const dHead = Math.max(2, Math.min(8, input.dHead ?? 6));
          const dHeadEven = dHead % 2 === 0 ? dHead : dHead - 1;
          const base = Math.max(100, Math.min(10000, input.base ?? 10000));
          return generateRoPESteps(seqLen, dHeadEven, base);
        },

        inputTypes: [
          { type: "number", key: "seqLen", label: "序列长度" },
          { type: "number", key: "dHead", label: "头维度（偶数）" },
          { type: "number", key: "base", label: "基底（default 10000）" },
        ],
        inputFields: [
          { type: "number", key: "seqLen", label: "序列长度 seq_len", placeholder: "4" },
          { type: "number", key: "dHead", label: "头维度 d_head（偶数）", placeholder: "6" },
          { type: "number", key: "base", label: "基底 base", placeholder: "10000" },
        ],
        testCases: [
          { label: "默认（4×6）", value: { seqLen: 4, dHead: 6, base: 10000 } },
          { label: "长序列（6×4）", value: { seqLen: 6, dHead: 4, base: 10000 } },
          { label: "小基底（base=100）", value: { seqLen: 4, dHead: 6, base: 100 } },
          { label: "小基底（base=1000）", value: { seqLen: 5, dHead: 4, base: 1000 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const Q = variables?.Q as number[][] | undefined;
          const K = variables?.K as number[][] | undefined;
          const Q_rotated = variables?.Q_rotated as number[][] | undefined;
          const K_rotated = variables?.K_rotated as number[][] | undefined;
          const thetas = variables?.thetas as number[] | undefined;
          const cosMatrix = variables?.cosMatrix as number[][] | undefined;
          const sinMatrix = variables?.sinMatrix as number[][] | undefined;
          const attnWeights = variables?.attnWeights as number[][] | undefined;
          const seqLen = (variables?.seqLen as number) ?? 4;
          const dHead = (variables?.dHead as number) ?? 6;
          const base = (variables?.base as number) ?? 10000;
          const halfD = (variables?.halfD as number) ?? 3;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">旋转位置编码（RoPE）</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  seq_len={seqLen} · d_head={dHead} · base={base} · 旋转对数={halfD}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <PipelineBar phase={phase} />
              </div>

              {/* RoPE vs Positional Encoding comparison */}
              <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                <h4 className="text-sm font-semibold text-emerald-800 mb-2">RoPE vs 绝对位置编码</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="font-semibold text-gray-700 mb-1">绝对位置编码（Sinusoidal）</div>
                    <div className="text-gray-600">PE 与词嵌入相加</div>
                    <div className="text-gray-600">编码绝对位置</div>
                    <div className="text-gray-500 mt-1">外推困难</div>
                  </div>
                  <div className="bg-white rounded p-2 border border-emerald-200">
                    <div className="font-semibold text-emerald-700 mb-1">RoPE（旋转位置编码）</div>
                    <div className="text-gray-600">旋转 Q、K 向量</div>
                    <div className="text-gray-600">编码相对位置</div>
                    <div className="text-emerald-600 mt-1">支持长度外推</div>
                  </div>
                </div>
              </div>

              {/* Rotation intuition */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">旋转直觉：2D 示例</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>对于维度对 (x_{`{2i}`}, x_{`{2i+1}`})，在位置 m 处旋转角度 θᵢ·m：</div>
                  <BlockMath math="\begin{pmatrix} x'_{2i} \\ x'_{2i+1} \end{pmatrix} = \begin{pmatrix} \cos(m\theta_i) & -\sin(m\theta_i) \\ \sin(m\theta_i) & \cos(m\theta_i) \end{pmatrix} \begin{pmatrix} x_{2i} \\ x_{2i+1} \end{pmatrix}" />
                  <div className="mt-1 text-blue-600">关键性质：旋转后的点积只依赖相对位置 (m-n)，不依赖绝对位置</div>
                </div>
              </div>

              {/* Q and K before rotation */}
              {Q && K && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">原始 Q / K（旋转前）</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <MatrixGrid matrix={Q} label="Q（原始）" />
                    <MatrixGrid matrix={K} label="K（原始）" />
                  </div>
                </div>
              )}

              {/* Thetas */}
              {thetas && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    旋转频率 θ_i&nbsp;
                    <span className="font-normal text-xs text-gray-500">
                      <InlineMath math={`\\theta_i = \\frac{1}{${base}^{2i/d}}`} />
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {thetas.map((theta, i) => (
                      <div key={i} className="bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-xs">
                        <span className="text-emerald-700 font-mono">θ_{i} = {theta.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">θ₀ 最大（高频，编码近距离信息），θ_{halfD-1} 最小（低频，编码远距离信息）</p>
                </div>
              )}

              {/* Cos/Sin matrices */}
              {cosMatrix && sinMatrix && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    cos/sin 矩阵&nbsp;
                    <span className="font-normal text-xs text-gray-500">
                      <InlineMath math="\text{angle}[m, i] = m \cdot \theta_i" />，每行对应一个位置
                    </span>
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <MatrixGrid matrix={cosMatrix} label="cos(mθ) 矩阵" />
                    <MatrixGrid matrix={sinMatrix} label="sin(mθ) 矩阵" />
                  </div>
                </div>
              )}

              {/* Rotated Q and K */}
              {Q_rotated && K_rotated && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-3">旋转后的 Q / K（包含位置信息）</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <MatrixGrid matrix={Q_rotated} label="Q_rotated（含位置）" />
                    <MatrixGrid matrix={K_rotated} label="K_rotated（含位置）" />
                  </div>
                  {Q && (
                    <div className="mt-3 text-xs text-emerald-700">
                      <span className="font-semibold">观察：</span>同一位置的旋转前后差异 = 位置编码的贡献
                    </div>
                  )}
                </div>
              )}

              {/* Attention weights */}
              {attnWeights && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    注意力权重（使用旋转后的 Q/K）
                  </h4>
                  <MatrixGrid matrix={attnWeights} label={`注意力权重 [${seqLen}×${seqLen}]`} />
                  <p className="text-xs text-gray-500 mt-2">
                    权重中已隐含了相对位置信息 (m-n)，近邻位置通常有更高的关注度
                  </p>
                </div>
              )}

              {/* RoPE core formula */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">RoPE 核心公式</h4>
                <div className="space-y-3 text-sm text-blue-900">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">旋转频率</div>
                    <BlockMath math="\theta_i = \frac{1}{\text{base}^{2i/d}}, \quad i = 0, 1, \ldots, \frac{d}{2}-1" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">旋转变换（每对维度）</div>
                    <BlockMath math="R(m, \theta_i) = \begin{pmatrix} \cos(m\theta_i) & -\sin(m\theta_i) \\ \sin(m\theta_i) & \cos(m\theta_i) \end{pmatrix}" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">相对位置性质（RoPE 的精华）</div>
                    <BlockMath math="\langle R_m \mathbf{q}, R_n \mathbf{k} \rangle = \langle R_{m-n} \mathbf{q}, \mathbf{k} \rangle" />
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

export default RoPEVisualizer;

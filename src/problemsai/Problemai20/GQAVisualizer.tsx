import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateGQASteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

const PROBLEM_ID = 10020;

interface GQAInput extends ProblemInput {
  seqLen: number;
  numQHeads: number;
  numKVHeads: number;
  dHead: number;
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
        <span className="font-normal text-gray-400 ml-1">[{rows}×{matrix[0]?.length ?? 0}]</span>
      </div>
      <table className="border-collapse text-xs font-mono">
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.slice(0, cols).map((v, j) => (
                <td key={j} className="w-10 h-7 text-center border border-white rounded" style={{ backgroundColor: heatColor(v, minV, maxV) }}>
                  {fmt(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const HEAD_COLORS = ["bg-blue-100 text-blue-700 border-blue-300", "bg-purple-100 text-purple-700 border-purple-300", "bg-amber-100 text-amber-700 border-amber-300", "bg-rose-100 text-rose-700 border-rose-300"];
const KV_COLORS = ["bg-teal-100 text-teal-800 border-teal-300", "bg-orange-100 text-orange-800 border-orange-300", "bg-pink-100 text-pink-800 border-pink-300", "bg-cyan-100 text-cyan-800 border-cyan-300"];

function GQAVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<GQAInput, Record<string, never>>
      config={{
        defaultInput: { seqLen: 4, numQHeads: 4, numKVHeads: 2, dHead: 4 },

        algorithm: (input) => {
          const seqLen = Math.max(2, Math.min(6, input.seqLen ?? 4));
          const numKVHeads = Math.max(1, Math.min(4, input.numKVHeads ?? 2));
          const numQHeads = Math.max(numKVHeads, Math.min(8, input.numQHeads ?? 4));
          // Ensure numQHeads is divisible by numKVHeads
          const adjustedQHeads = Math.floor(numQHeads / numKVHeads) * numKVHeads;
          const dHead = Math.max(2, Math.min(8, input.dHead ?? 4));
          return generateGQASteps(seqLen, adjustedQHeads, numKVHeads, dHead);
        },

        inputTypes: [
          { type: "number", key: "seqLen", label: "序列长度" },
          { type: "number", key: "numQHeads", label: "Q 头数" },
          { type: "number", key: "numKVHeads", label: "KV 头数" },
          { type: "number", key: "dHead", label: "头维度" },
        ],
        inputFields: [
          { type: "number", key: "seqLen", label: "序列长度 seq_len", placeholder: "4" },
          { type: "number", key: "numQHeads", label: "Q 头数（需整除 KV 头数）", placeholder: "4" },
          { type: "number", key: "numKVHeads", label: "KV 头数", placeholder: "2" },
          { type: "number", key: "dHead", label: "头维度 d_head", placeholder: "4" },
        ],
        testCases: [
          { label: "GQA（4Q/2KV）", value: { seqLen: 4, numQHeads: 4, numKVHeads: 2, dHead: 4 } },
          { label: "MQA（4Q/1KV）", value: { seqLen: 4, numQHeads: 4, numKVHeads: 1, dHead: 4 } },
          { label: "MHA（4Q/4KV）", value: { seqLen: 4, numQHeads: 4, numKVHeads: 4, dHead: 4 } },
          { label: "GQA（6Q/2KV）", value: { seqLen: 4, numQHeads: 6, numKVHeads: 2, dHead: 4 } },
        ],

        render: ({ variables }) => {
          const X = variables?.X as number[][] | undefined;
          const Q_head0 = variables?.Q_head0 as number[][] | undefined;
          const K_head0 = variables?.K_head0 as number[][] | undefined;
          const V_head0 = variables?.V_head0 as number[][] | undefined;
          const attnOut_g0_q0 = variables?.attnOut_g0_q0 as number[][] | undefined;
          const concatOut = variables?.concatOut as number[][] | undefined;
          const groupAssignment = variables?.groupAssignment as number[] | undefined;
          const seqLen = (variables?.seqLen as number) ?? 4;
          const numQHeads = (variables?.numQHeads as number) ?? 4;
          const numKVHeads = (variables?.numKVHeads as number) ?? 2;
          const dHead = (variables?.dHead as number) ?? 4;
          const numGroups = (variables?.numGroups as number) ?? 2;
          const dModel = (variables?.dModel as number) ?? 16;
          const kvMemoryRatio = (variables?.kvMemoryRatio as number) ?? 0.5;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">分组查询注意力（GQA）</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  Q_heads={numQHeads} · KV_heads={numKVHeads} · groups={numGroups} · d_head={dHead} · seq_len={seqLen}
                </p>
              </div>

              {/* MHA vs GQA vs MQA comparison */}
              <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
                <h4 className="text-sm font-semibold text-indigo-800 mb-3">注意力变体对比</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className={`rounded p-2 border ${numQHeads === numKVHeads ? "bg-white border-indigo-400 ring-1 ring-indigo-400" : "bg-white border-gray-200"}`}>
                    <div className="font-semibold text-gray-700 mb-1">MHA（多头注意力）</div>
                    <div className="text-gray-600">Q_heads = KV_heads</div>
                    <div className="text-gray-500 mt-1">性能最好，内存最多</div>
                    {numQHeads === numKVHeads && <div className="text-indigo-600 font-medium mt-1">← 当前配置</div>}
                  </div>
                  <div className={`rounded p-2 border ${numKVHeads > 1 && numKVHeads < numQHeads ? "bg-white border-indigo-400 ring-1 ring-indigo-400" : "bg-white border-gray-200"}`}>
                    <div className="font-semibold text-teal-700 mb-1">GQA（分组查询）</div>
                    <div className="text-gray-600">1 &lt; KV_heads &lt; Q_heads</div>
                    <div className="text-gray-500 mt-1">平衡性能与内存</div>
                    {numKVHeads > 1 && numKVHeads < numQHeads && <div className="text-indigo-600 font-medium mt-1">← 当前配置</div>}
                  </div>
                  <div className={`rounded p-2 border ${numKVHeads === 1 ? "bg-white border-indigo-400 ring-1 ring-indigo-400" : "bg-white border-gray-200"}`}>
                    <div className="font-semibold text-rose-700 mb-1">MQA（多查询注意力）</div>
                    <div className="text-gray-600">KV_heads = 1</div>
                    <div className="text-gray-500 mt-1">内存最少，质量下降</div>
                    {numKVHeads === 1 && <div className="text-indigo-600 font-medium mt-1">← 当前配置</div>}
                  </div>
                </div>
              </div>

              {/* Head grouping visualization */}
              {groupAssignment && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Q 头分组分配</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {groupAssignment.map((g, h) => (
                      <div key={h} className={`px-3 py-1.5 rounded border text-xs font-medium ${HEAD_COLORS[g % HEAD_COLORS.length]}`}>
                        Q_{h} → KV组{g}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: numKVHeads }, (_, g) => (
                      <div key={g} className={`px-3 py-1.5 rounded border text-xs font-medium ${KV_COLORS[g % KV_COLORS.length]}`}>
                        KV组{g}（共享 {numGroups} 个 Q 头）
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Memory savings */}
              <div className="bg-teal-50 rounded-lg border border-teal-200 p-4">
                <h4 className="text-sm font-semibold text-teal-800 mb-2">KV 缓存节省</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <div className="text-gray-600">MHA KV 缓存</div>
                    <div className="font-mono text-red-600 mt-1">
                      {numQHeads} × seq × d_head × 2
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border border-teal-200">
                    <div className="text-gray-600">GQA KV 缓存</div>
                    <div className="font-mono text-teal-600 mt-1">
                      {numKVHeads} × seq × d_head × 2
                    </div>
                    <div className="text-teal-700 mt-1 font-medium">
                      节省 {Math.round((1 - kvMemoryRatio) * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Input */}
              {X && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <MatrixGrid matrix={X} label="输入 X" />
                </div>
              )}

              {/* Q/K/V heads */}
              {Q_head0 && K_head0 && V_head0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    Q 头 0 / K 头 0 / V 头 0（每头维度 d_head={dHead}）
                  </h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <MatrixGrid matrix={Q_head0} label="Q_head₀" />
                    <MatrixGrid matrix={K_head0} label="K_head₀（组0共享）" />
                    <MatrixGrid matrix={V_head0} label="V_head₀（组0共享）" />
                  </div>
                </div>
              )}

              {/* Attention output */}
              {attnOut_g0_q0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Q头0的注意力输出（使用KV组0）</h4>
                  <MatrixGrid matrix={attnOut_g0_q0} label={`attn_out [${seqLen}×${dHead}]`} />
                </div>
              )}

              {/* Concat output */}
              {concatOut && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    拼接输出（{numQHeads} 个头 × d_head={dHead}）
                  </h4>
                  <MatrixGrid matrix={concatOut} label={`concat_out [${seqLen}×${dModel}]`} />
                  <p className="text-xs text-emerald-700 mt-2">
                    输出形状与 MHA 完全相同，但 KV 缓存减少了 {Math.round((1 - kvMemoryRatio) * 100)}%
                  </p>
                </div>
              )}

              {/* Formula */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">GQA 核心公式</h4>
                <div className="space-y-3 text-sm text-blue-900">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">分组注意力（组 g，头 q）</div>
                    <BlockMath math="\text{head}_{g,q} = \text{Attention}(Q_{g \cdot G + q}, K_g, V_g)" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">输出拼接</div>
                    <BlockMath math="\text{GQA}(X) = \text{Concat}(\text{head}_{0,0}, \ldots, \text{head}_{H_{kv}-1, G-1}) W^O" />
                  </div>
                  <div className="text-xs text-blue-700">
                    其中 G = num_groups = num_q_heads / num_kv_heads = {numGroups}
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

export default GQAVisualizer;

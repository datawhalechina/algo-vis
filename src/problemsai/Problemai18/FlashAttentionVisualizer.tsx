import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateFlashAttentionSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

const PROBLEM_ID = 10018;

interface FlashAttnInput extends ProblemInput {
  seqLen: number;
  dHead: number;
  blockSize: number;
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
        </span>
      </div>
      <table className="border-collapse text-xs font-mono">
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              {row.slice(0, cols).map((v, j) => (
                <td
                  key={j}
                  className="w-10 h-7 text-center border border-white rounded"
                  style={{ backgroundColor: heatColor(v, minV, maxV) }}
                >
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
  { key: "standard_scores", label: "标准注意力对比" },
  { key: "block_compute", label: "分块计算" },
  { key: "normalize", label: "归一化" },
  { key: "done", label: "完成" },
];

function PipelineBar({ phase }: { phase: string }) {
  const normalizedPhase = phase.startsWith("block_compute") ? "block_compute" : phase;
  const currentIdx = PIPELINE_STEPS.findIndex((s) => s.key === normalizedPhase);
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-center gap-0.5 text-xs min-w-max">
        {PIPELINE_STEPS.map((s, idx) => {
          const isDone = idx < currentIdx;
          const isActive = s.key === normalizedPhase;
          return (
            <div key={s.key} className="flex items-center">
              <div className={`px-2 py-1 rounded whitespace-nowrap ${isActive ? "bg-indigo-500 text-white font-semibold" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                {s.label}
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className={`w-2.5 h-0.5 mx-0.5 ${isDone || isActive ? "bg-indigo-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlashAttentionVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<FlashAttnInput, Record<string, never>>
      config={{
        defaultInput: { seqLen: 6, dHead: 4, blockSize: 2 },

        algorithm: (input) => {
          const seqLen = Math.max(4, Math.min(8, input.seqLen ?? 6));
          const dHead = Math.max(2, Math.min(8, input.dHead ?? 4));
          const blockSize = Math.max(1, Math.min(Math.floor(seqLen / 2), input.blockSize ?? 2));
          return generateFlashAttentionSteps(seqLen, dHead, blockSize);
        },

        inputTypes: [
          { type: "number", key: "seqLen", label: "序列长度 N" },
          { type: "number", key: "dHead", label: "头维度 d" },
          { type: "number", key: "blockSize", label: "块大小 B" },
        ],
        inputFields: [
          { type: "number", key: "seqLen", label: "序列长度 N", placeholder: "6" },
          { type: "number", key: "dHead", label: "头维度 d_head", placeholder: "4" },
          { type: "number", key: "blockSize", label: "块大小 block_size", placeholder: "2" },
        ],
        testCases: [
          { label: "默认（N=6, B=2）", value: { seqLen: 6, dHead: 4, blockSize: 2 } },
          { label: "较大块（N=6, B=3）", value: { seqLen: 6, dHead: 4, blockSize: 3 } },
          { label: "长序列（N=8, B=2）", value: { seqLen: 8, dHead: 4, blockSize: 2 } },
          { label: "最小块（N=4, B=1）", value: { seqLen: 4, dHead: 4, blockSize: 1 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const fullScores = variables?.fullScores as number[][] | undefined;
          const currentBlock = variables?.currentBlock as { row: number; col: number } | undefined;
          const Q_block0 = variables?.Q_block0 as number[][] | undefined;
          const K_block = variables?.K_block as number[][] | undefined;
          const localScores = variables?.localScores as number[][] | undefined;
          const runningMax = variables?.runningMax as number[] | undefined;
          const runningSumExp = variables?.runningSumExp as number[] | undefined;
          const outputAccum = variables?.outputAccum as number[][] | undefined;
          const flashOutput = variables?.flashOutput as number[][] | undefined;
          const seqLen = (variables?.seqLen as number) ?? 6;
          const dHead = (variables?.dHead as number) ?? 4;
          const blockSize = (variables?.blockSize as number) ?? 2;
          const numBlocks = (variables?.numBlocks as number) ?? 3;
          const memoryStandard = (variables?.memoryStandard as number) ?? seqLen * seqLen;
          const memoryFlash = (variables?.memoryFlash as number) ?? seqLen * blockSize;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">Flash Attention</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  N={seqLen} · d={dHead} · block_size={blockSize} · blocks={numBlocks}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <PipelineBar phase={phase} />
              </div>

              {/* Memory comparison */}
              <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-4">
                <h4 className="text-sm font-semibold text-indigo-800 mb-3">内存对比</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white rounded p-3 border border-red-200">
                    <div className="font-semibold text-red-700 mb-1">标准注意力</div>
                    <div className="text-gray-600">存储完整注意力矩阵</div>
                    <div className="font-mono text-red-600 mt-1">O(N²) = O({memoryStandard})</div>
                    <div className="text-gray-500">需 {memoryStandard} 个数值</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-green-200">
                    <div className="font-semibold text-green-700 mb-1">Flash Attention</div>
                    <div className="text-gray-600">只加载 Q/K/V 块</div>
                    <div className="font-mono text-green-600 mt-1">O(N×B) = O({memoryFlash})</div>
                    <div className="text-gray-500">节省 {Math.round((1 - memoryFlash / memoryStandard) * 100)}%</div>
                  </div>
                </div>
              </div>

              {/* Standard attention scores for comparison */}
              {fullScores && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    标准注意力分数矩阵（对比用）
                    <span className="font-normal text-xs text-gray-500 ml-1">
                      <InlineMath math="\frac{QK^T}{\sqrt{d}}" />
                    </span>
                  </h4>
                  <MatrixGrid matrix={fullScores} label={`完整分数矩阵 [${seqLen}×${seqLen}] — Flash Attention 永不实例化此矩阵`} />
                  <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                    标准方法需要存储此 {seqLen}×{seqLen} 矩阵，长序列时内存爆炸
                  </div>
                </div>
              )}

              {/* Block computation visualization */}
              {currentBlock && Q_block0 && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-3">
                    当前块计算：行块 {currentBlock.row}，列块 {currentBlock.col}
                  </h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Q_block0 && <MatrixGrid matrix={Q_block0} label={`Q 块 [${Q_block0.length}×${dHead}]`} />}
                    {K_block && <MatrixGrid matrix={K_block} label={`K 块 [${K_block.length}×${dHead}]`} />}
                  </div>
                  {localScores && (
                    <div className="mt-3">
                      <MatrixGrid matrix={localScores} label={`局部分数 S_ij = Q_i × K_j^T / √d`} />
                    </div>
                  )}
                </div>
              )}

              {/* Online softmax statistics */}
              {runningMax && runningSumExp && (
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">
                    在线 Softmax 统计（每个 Q 行）
                  </h4>
                  <div className="overflow-auto">
                    <table className="text-xs border-collapse w-full">
                      <thead>
                        <tr className="bg-amber-100">
                          <th className="p-2 text-left">Q 行</th>
                          <th className="p-2">running_max (m)</th>
                          <th className="p-2">running_sum_exp (ℓ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {runningMax.map((m, i) => (
                          <tr key={i} className="border-t border-amber-200">
                            <td className="p-2 font-mono">行 {i}</td>
                            <td className="p-2 font-mono text-center">{fmt(m, 3)}</td>
                            <td className="p-2 font-mono text-center">{runningSumExp[i] !== undefined ? fmt(runningSumExp[i], 3) : "--"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 text-xs text-amber-700">
                    <InlineMath math="m_{\text{new}} = \max(m_{\text{prev}}, \max_j S_{ij})" />，&nbsp;
                    <InlineMath math="\ell_{\text{new}} = e^{m_{\text{prev}}-m_{\text{new}}} \ell_{\text{prev}} + \sum_j e^{S_{ij}-m_{\text{new}}}" />
                  </div>
                </div>
              )}

              {/* Output accumulation */}
              {outputAccum && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    累积输出（待归一化）
                  </h4>
                  <MatrixGrid matrix={outputAccum} label="output_accum（除以 ℓ 后得最终输出）" />
                </div>
              )}

              {/* Flash output */}
              {flashOutput && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">Flash Attention 输出（第 0 行块）</h4>
                  <MatrixGrid matrix={flashOutput} label={`flash_output [${flashOutput.length}×${dHead}]（与标准注意力等价）`} />
                </div>
              )}

              {/* Algorithm explanation */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">Flash Attention 核心公式</h4>
                <div className="space-y-3 text-sm text-blue-900">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">在线 Softmax（Online Softmax）</div>
                    <BlockMath math="\begin{aligned} m_{\text{new}} &= \max(m_{\text{prev}}, m_{\text{block}}) \\ \ell_{\text{new}} &= e^{m_{\text{prev}} - m_{\text{new}}} \ell_{\text{prev}} + e^{m_{\text{block}} - m_{\text{new}}} \ell_{\text{block}} \\ O_{\text{new}} &= \frac{e^{m_{\text{prev}} - m_{\text{new}}} \ell_{\text{prev}} O_{\text{prev}} + e^{m_{\text{block}} - m_{\text{new}}} \ell_{\text{block}} O_{\text{block}}}{\ell_{\text{new}}} \end{aligned}" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">最终输出</div>
                    <BlockMath math="O = \frac{\text{output\_accum}}{\ell}" />
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

export default FlashAttentionVisualizer;

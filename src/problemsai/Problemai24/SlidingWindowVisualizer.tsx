import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { generateSlidingWindowSteps } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

const PROBLEM_ID = 10024;

interface SlidingWindowInput extends ProblemInput {
  seqLen: number;
  windowSize: number;
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
  windowSize?: number;
  isWindow?: boolean;
  maxCols?: number;
}
function MatrixGrid({ matrix, label, windowSize, isWindow = false, maxCols }: MatrixGridProps) {
  const rows = matrix.length;
  const cols = maxCols ? Math.min(matrix[0]?.length ?? 0, maxCols) : (matrix[0]?.length ?? 0);
  const allVals = matrix.flatMap((r) => r.slice(0, cols));
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const halfW = windowSize ? Math.floor(windowSize / 2) : 0;

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
              {row.slice(0, cols).map((v, j) => {
                const isMasked = isWindow && Math.abs(i - j) > halfW;
                return (
                  <td
                    key={j}
                    className={`w-10 h-7 text-center border border-white rounded text-xs ${isMasked ? "text-gray-300" : ""}`}
                    style={{
                      backgroundColor: isMasked ? "#f3f4f6" : heatColor(v, minV, maxV),
                      opacity: isMasked ? 0.5 : 1,
                    }}
                  >
                    {isMasked ? "–" : fmt(v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {isWindow && windowSize && (
        <div className="text-xs text-gray-500 mt-1">
          灰色格 = 窗口外（被掩码为 -∞）
        </div>
      )}
    </div>
  );
}

const PIPELINE_STEPS = [
  { key: "init", label: "初始化" },
  { key: "full_attn", label: "标准注意力对比" },
  { key: "window_mask", label: "创建窗口掩码" },
  { key: "windowed_attn", label: "窗口注意力权重" },
  { key: "receptive_field", label: "感受野分析" },
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
              <div className={`px-2 py-1 rounded whitespace-nowrap ${isActive ? "bg-sky-600 text-white font-semibold" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                {s.label}
              </div>
              {idx < PIPELINE_STEPS.length - 1 && (
                <div className={`w-2.5 h-0.5 mx-0.5 ${isDone || isActive ? "bg-sky-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlidingWindowVisualizer() {
  const coreIdea = getAiProblemCoreIdea(PROBLEM_ID);

  return (
    <ConfigurableVisualizer<SlidingWindowInput, Record<string, never>>
      config={{
        defaultInput: { seqLen: 8, windowSize: 3, dHead: 4 },

        algorithm: (input) => {
          const seqLen = Math.max(4, Math.min(10, input.seqLen ?? 8));
          const windowSize = Math.max(2, Math.min(seqLen - 1, input.windowSize ?? 3));
          const dHead = Math.max(2, Math.min(8, input.dHead ?? 4));
          return generateSlidingWindowSteps(seqLen, windowSize, dHead);
        },

        inputTypes: [
          { type: "number", key: "seqLen", label: "序列长度" },
          { type: "number", key: "windowSize", label: "窗口大小" },
          { type: "number", key: "dHead", label: "头维度" },
        ],
        inputFields: [
          { type: "number", key: "seqLen", label: "序列长度 N", placeholder: "8" },
          { type: "number", key: "windowSize", label: "窗口大小 w", placeholder: "3" },
          { type: "number", key: "dHead", label: "头维度 d_head", placeholder: "4" },
        ],
        testCases: [
          { label: "默认（N=8, w=3）", value: { seqLen: 8, windowSize: 3, dHead: 4 } },
          { label: "更大窗口（N=8, w=5）", value: { seqLen: 8, windowSize: 5, dHead: 4 } },
          { label: "小窗口（N=8, w=2）", value: { seqLen: 8, windowSize: 2, dHead: 4 } },
          { label: "长序列（N=10, w=3）", value: { seqLen: 10, windowSize: 3, dHead: 4 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const fullAttnW = variables?.fullAttnW as number[][] | undefined;
          const windowAttnW = variables?.windowAttnW as number[][] | undefined;
          const windowMask = variables?.windowMask as number[][] | undefined;
          const windowAttnOut = variables?.windowAttnOut as number[][] | undefined;
          const layer1Range = (variables?.layer1Range as number) ?? 0;
          const layer2Range = (variables?.layer2Range as number) ?? 0;
          const layer3Range = (variables?.layer3Range as number) ?? 0;
          const complexityFull = (variables?.complexityFull as number) ?? 0;
          const complexityWindow = (variables?.complexityWindow as number) ?? 0;
          const reductionPct = (variables?.reductionPct as number) ?? 0;
          const seqLen = (variables?.seqLen as number) ?? 8;
          const windowSize = (variables?.windowSize as number) ?? 3;
          const dHead = (variables?.dHead as number) ?? 4;
          const halfW = (variables?.halfW as number) ?? 1;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">滑动窗口注意力</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">
                  N={seqLen} · window_size={windowSize} · d_head={dHead} · 半径={halfW}
                </p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <PipelineBar phase={phase} />
              </div>

              {/* Complexity comparison */}
              {complexityFull > 0 && (
                <div className="bg-sky-50 rounded-lg border border-sky-200 p-4">
                  <h4 className="text-sm font-semibold text-sky-800 mb-3">复杂度对比</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white rounded p-2 border border-red-200">
                      <div className="font-semibold text-red-700">标准注意力</div>
                      <div className="font-mono text-red-600 mt-1">O(N²) = O({complexityFull})</div>
                    </div>
                    <div className="bg-white rounded p-2 border border-green-200">
                      <div className="font-semibold text-green-700">滑动窗口</div>
                      <div className="font-mono text-green-600 mt-1">O(N×w) = O({complexityWindow})</div>
                      <div className="text-green-600 font-medium mt-1">减少 {reductionPct}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attention matrices side by side */}
              {fullAttnW && windowAttnW && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">注意力权重对比</h4>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <MatrixGrid matrix={fullAttnW} label="标准注意力（全局）" />
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600">
                        每个位置关注所有 {seqLen} 个位置
                      </div>
                    </div>
                    <div>
                      <MatrixGrid matrix={windowAttnW} label={`滑动窗口注意力（w=${windowSize}）`} isWindow windowSize={windowSize} />
                      <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-600">
                        每个位置只关注窗口内 {windowSize} 个位置
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Window mask */}
              {windowMask && (
                <div className="bg-sky-50 rounded-lg border border-sky-200 p-4">
                  <h4 className="text-sm font-semibold text-sky-800 mb-2">
                    窗口掩码矩阵&nbsp;
                    <span className="font-normal text-xs text-sky-600">
                      <InlineMath math={`\\text{mask}[i,j] = \\begin{cases} 0 & |i-j| \\leq ${halfW} \\\\ -\\infty & |i-j| > ${halfW} \\end{cases}`} />
                    </span>
                  </h4>
                  <div className="overflow-auto">
                    <table className="border-collapse text-xs font-mono">
                      <tbody>
                        {windowMask.map((row, i) => (
                          <tr key={i}>
                            {row.map((_, j) => {
                              const inWindow = Math.abs(i - j) <= halfW;
                              return (
                                <td key={j} className={`w-10 h-7 text-center border border-white rounded ${inWindow ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-300"}`}>
                                  {inWindow ? "0" : "-∞"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-4 text-xs mt-2">
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-green-100 rounded inline-block border border-green-300"></span>
                      <span className="text-green-700">窗口内（可见）</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-gray-100 rounded inline-block border border-gray-300"></span>
                      <span className="text-gray-500">窗口外（屏蔽）</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Receptive field expansion */}
              {layer1Range > 0 && (
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                  <h4 className="text-sm font-semibold text-amber-800 mb-3">多层感受野扩展</h4>
                  <div className="space-y-2">
                    {[
                      { layer: 1, range: layer1Range, color: "bg-blue-100 text-blue-700" },
                      { layer: 2, range: layer2Range, color: "bg-purple-100 text-purple-700" },
                      { layer: 3, range: layer3Range, color: "bg-rose-100 text-rose-700" },
                    ].map(({ layer, range, color }) => (
                      <div key={layer} className="flex items-center gap-3 text-xs">
                        <div className={`px-3 py-1.5 rounded text-xs ${color} min-w-[80px] text-center`}>
                          第 {layer} 层
                        </div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color} transition-all`}
                            style={{ width: `${Math.min(100, (range / seqLen) * 100)}%` }}
                          />
                        </div>
                        <span className="text-gray-600 min-w-[80px]">
                          感受野 = {Math.min(range, seqLen)}（{Math.min(range, seqLen) >= seqLen ? "覆盖全局" : `/${seqLen}`}）
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 mt-2">
                    {Math.ceil(seqLen / windowSize)} 层后，感受野覆盖整个序列，实现全局依赖捕获
                  </p>
                </div>
              )}

              {/* Attention output */}
              {windowAttnOut && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">窗口注意力输出</h4>
                  <MatrixGrid matrix={windowAttnOut} label={`output [${seqLen}×${dHead}]`} />
                </div>
              )}

              {/* Formula */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">核心公式</h4>
                <div className="space-y-3 text-sm text-blue-900">
                  <div>
                    <div className="text-xs text-blue-600 mb-1">窗口掩码</div>
                    <BlockMath math="M[i,j] = \begin{cases} 0 & |i-j| \leq w/2 \\ -\infty & |i-j| > w/2 \end{cases}" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">窗口注意力</div>
                    <BlockMath math="\text{WA}(Q,K,V) = \text{softmax}\!\left(\frac{QK^T}{\sqrt{d_k}} + M\right)V" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">复杂度</div>
                    <BlockMath math="\text{标准}: O(N^2 d) \to \text{窗口}: O(N \cdot w \cdot d)" />
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

export default SlidingWindowVisualizer;

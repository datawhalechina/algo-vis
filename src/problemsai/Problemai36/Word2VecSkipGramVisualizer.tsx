import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  generateSkipGramSteps,
  DEFAULT_TOKENS,
  SkipGramToken,
} from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface SkipGramInput extends ProblemInput {
  centerIdx: number;
  windowSize: number;
}

function getHeatColor(val: number): string {
  const w = Math.max(0, Math.min(val, 1));
  const hue = 220 - w * 180;
  return `hsl(${hue}, 70%, ${88 - w * 30}%)`;
}

function Word2VecSkipGramVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10036);

  return (
    <ConfigurableVisualizer<SkipGramInput, Record<string, never>>
      config={{
        defaultInput: { centerIdx: 1, windowSize: 2 },

        algorithm: (input) => {
          const ci = typeof input.centerIdx === "number" ? input.centerIdx : parseInt(String(input.centerIdx)) || 1;
          const ws = typeof input.windowSize === "number" ? input.windowSize : parseInt(String(input.windowSize)) || 2;
          return generateSkipGramSteps(DEFAULT_TOKENS, ci, Math.max(1, Math.min(ws, 3)));
        },

        inputTypes: [
          { type: "number", key: "centerIdx", label: "中心词索引（0-4）", min: 0, max: 4 },
          { type: "number", key: "windowSize", label: "窗口大小", min: 1, max: 3 },
        ],
        inputFields: [
          { type: "number", key: "centerIdx", label: "中心词索引（0=the,1=cat,2=sat,3=on,4=mat）", placeholder: "1" },
          { type: "number", key: "windowSize", label: "上下文窗口大小", placeholder: "2" },
        ],

        testCases: [
          { label: "cat（窗口2）", value: { centerIdx: 1, windowSize: 2 } },
          { label: "sat（窗口1）", value: { centerIdx: 2, windowSize: 1 } },
          { label: "on（窗口3）", value: { centerIdx: 3, windowSize: 3 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const tokens = (variables?.tokens as unknown as SkipGramToken[]) ?? DEFAULT_TOKENS;
          const center = variables?.center as unknown as SkipGramToken | undefined;
          const centerIdx = (variables?.centerIdx as number) ?? 1;
          const windowSize = (variables?.windowSize as number) ?? 2;
          const contextIndices = (variables?.contextIndices as number[]) ?? [];
          const currentContextIdx = variables?.currentContextIdx as number | undefined;
          const allProbs = (variables?.allProbs as unknown as Array<{ word: string; prob: number }>) ?? [];
          const contextProbs = (variables?.contextProbs as unknown as Array<{ word: string; prob: number }>) ?? [];
          const loss = variables?.loss as number | undefined;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            center: { label: "中心词嵌入", color: "bg-blue-100 text-blue-700" },
            window: { label: "上下文窗口", color: "bg-violet-100 text-violet-700" },
            scoring: { label: "得分计算", color: "bg-amber-100 text-amber-700" },
            softmax: { label: "Softmax", color: "bg-orange-100 text-orange-700" },
            complete: { label: "计算完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              {/* 标题 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Word2Vec Skip-gram</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="P(w_O|w_I) = \frac{\exp(v_{w_O}^\top v_{w_I})}{\sum_{w} \exp(v_w^\top v_{w_I})}" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 句子与窗口可视化 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  句子：窗口大小 <InlineMath math={`w=${windowSize}`} />
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {tokens.map((t, i) => {
                    const isCenter = i === centerIdx;
                    const isContext = contextIndices.includes(i);
                    const isCurrent = i === currentContextIdx;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div
                          className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                            isCenter
                              ? "border-blue-500 bg-blue-100 text-blue-800 shadow-md"
                              : isCurrent
                              ? "border-orange-400 bg-orange-50 text-orange-800"
                              : isContext
                              ? "border-violet-300 bg-violet-50 text-violet-700"
                              : "border-gray-200 bg-gray-50 text-gray-500"
                          }`}
                        >
                          {t.word}
                        </div>
                        <span className="text-[10px] text-gray-400">idx={i}</span>
                        {isCenter && <span className="text-[10px] text-blue-600 font-semibold">中心词</span>}
                        {isContext && !isCenter && <span className="text-[10px] text-violet-600">上下文</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 中心词向量 */}
              {center && ["center", "window", "scoring", "softmax", "complete"].includes(phase) && (
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    中心词嵌入 <InlineMath math={`v_{\\text{${center.word}}}`} />
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {center.embedding.map((v, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div
                          className="w-12 h-10 rounded flex items-center justify-center text-[11px] font-mono"
                          style={{ backgroundColor: getHeatColor(v), color: v > 0.5 ? "#fff" : "#1e3a5f" }}
                        >
                          {v.toFixed(2)}
                        </div>
                        <span className="text-[9px] text-gray-400">d{i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 概率分布 */}
              {allProbs.length > 0 && ["softmax", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    预测概率分布 <InlineMath math="P(w_O | w_I)" />
                  </h4>
                  <div className="space-y-2">
                    {allProbs.map((p) => {
                      const isCtx = contextProbs.some((c) => c.word === p.word);
                      return (
                        <div key={p.word} className="flex items-center gap-3">
                          <span className={`text-sm font-medium w-12 ${isCtx ? "text-violet-700 font-bold" : "text-gray-500"}`}>
                            {p.word}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                            <div
                              className="h-5 rounded-full flex items-center justify-end pr-2"
                              style={{
                                width: `${Math.round(p.prob * 100)}%`,
                                backgroundColor: isCtx ? "#8b5cf6" : getHeatColor(p.prob),
                              }}
                            >
                              <span className="text-[10px] font-mono text-white">{p.prob.toFixed(3)}</span>
                            </div>
                          </div>
                          {isCtx && <span className="text-[10px] text-violet-600 font-semibold">目标</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 损失函数 */}
              {loss !== undefined && phase === "complete" && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">训练损失</h4>
                  <BlockMath math={`\\mathcal{L} = -\\frac{1}{|C|}\\sum_{c \\in C} \\log P(w_c | w_{center}) = ${loss.toFixed(4)}`} />
                  <p className="text-xs text-emerald-600 mt-2">通过反向传播最小化此损失，更新嵌入矩阵 W_in 和 W_out</p>
                </div>
              )}

              {/* 流程 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 初始化" },
                    { id: "center", label: "② 中心词嵌入" },
                    { id: "window", label: "③ 确定窗口" },
                    { id: "scoring", label: "④ 计算得分" },
                    { id: "softmax", label: "⑤ Softmax概率" },
                    { id: "complete", label: "⑥ 计算损失" },
                  ].map((step, idx, arr) => {
                    const order = ["init", "center", "window", "scoring", "softmax", "complete"];
                    const isDone = order.indexOf(phase) >= order.indexOf(step.id);
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          step.id === phase ? "bg-blue-600 text-white shadow-sm" :
                          isDone ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"
                        }`}>{step.label}</span>
                        {idx < arr.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        },
      }}
    />
  );
}

export default Word2VecSkipGramVisualizer;

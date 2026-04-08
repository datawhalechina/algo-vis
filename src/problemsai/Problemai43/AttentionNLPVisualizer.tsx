import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateAttentionNLPSteps, DEFAULT_ATTENTION_SAMPLE } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface AttentionNLPInput extends ProblemInput {
  sampleIdx: number;
}

function getHeatColor(weight: number): string {
  const w = Math.max(0, Math.min(weight, 1));
  const hue = 220 - w * 180;
  const sat = 70;
  const light = 88 - w * 30;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

function AttentionNLPVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10043);

  return (
    <ConfigurableVisualizer<AttentionNLPInput, Record<string, never>>
      config={{
        defaultInput: { sampleIdx: 0 },

        algorithm: () => generateAttentionNLPSteps(DEFAULT_ATTENTION_SAMPLE),

        inputTypes: [{ type: "number", key: "sampleIdx", label: "示例", min: 0, max: 0 }],
        inputFields: [{ type: "number", key: "sampleIdx", label: "示例（固定）", placeholder: "0" }],

        testCases: [{ label: "英译中注意力", value: { sampleIdx: 0 } }],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const encoderTokens = (variables?.encoderTokens as string[]) ?? DEFAULT_ATTENTION_SAMPLE.encoderTokens;
          const decoderToken = (variables?.decoderToken as string) ?? DEFAULT_ATTENTION_SAMPLE.decoderToken;
          const eScores = (variables?.eScores as number[]) ?? [];
          const attentionWeights = (variables?.attentionWeights as number[]) ?? [];
          const contextVector = variables?.contextVector as number[] | undefined;
          const currentIdx = variables?.currentIdx as number | undefined;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            score: { label: "计算注意力分数", color: "bg-blue-100 text-blue-700" },
            softmax: { label: "Softmax归一化", color: "bg-amber-100 text-amber-700" },
            context: { label: "加权求和", color: "bg-emerald-100 text-emerald-700" },
            complete: { label: "注意力完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const maxWeight = attentionWeights.length > 0 ? Math.max(...attentionWeights) : 1;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">注意力机制（NLP）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="\alpha_i = \frac{\exp(e_i)}{\sum_j \exp(e_j)}, \quad c = \sum_i \alpha_i h_i" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 编码器状态与解码器状态 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">编码器隐藏状态</h4>
                  <div className="flex gap-2 flex-wrap">
                    {encoderTokens.map((token, i) => (
                      <div key={i} className={`flex flex-col items-center gap-1 transition-all ${i === currentIdx && phase === "score" ? "scale-110" : ""}`}>
                        <div className={`px-3 py-2 rounded-lg border font-medium text-sm ${
                          i === currentIdx && phase === "score" ? "border-blue-500 bg-blue-200 shadow" : "border-blue-200 bg-white text-blue-700"
                        }`}>{token}</div>
                        <span className="text-[9px] text-blue-500">h_{i}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-violet-50 rounded-lg border border-violet-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-violet-800 mb-2">解码器当前状态</h4>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-3 rounded-lg border-2 border-violet-400 bg-white text-violet-800 font-bold text-base">
                      "{decoderToken}"
                    </div>
                    <div>
                      <p className="text-xs text-violet-600">解码器状态 s</p>
                      <p className="text-xs text-violet-500">[{DEFAULT_ATTENTION_SAMPLE.decoderState.map((v) => v.toFixed(2)).join(", ")}]</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 注意力分数 */}
              {eScores.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    注意力分数 <InlineMath math="e_i = \text{score}(h_i, s) = h_i \cdot s" />
                  </h4>
                  <div className="space-y-2">
                    {eScores.map((score, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-blue-700 w-20">{encoderTokens[i]}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                          <div className="h-5 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.round(Math.min(score / Math.max(...eScores, 1), 1) * 100)}%`, backgroundColor: getHeatColor(score / Math.max(...eScores, 1)) }}>
                            <span className="text-[10px] font-mono text-white">{score.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 注意力权重热力图 */}
              {attentionWeights.length > 0 && ["softmax", "context", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    注意力权重 <InlineMath math="\alpha_i = \text{Softmax}(e_i)" />
                  </h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    {encoderTokens.map((token, i) => {
                      const weight = attentionWeights[i] ?? 0;
                      const isMax = weight === maxWeight;
                      return (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div
                            className={`flex items-center justify-center rounded-lg font-bold text-sm transition-all ${isMax ? "ring-2 ring-offset-1 ring-amber-400 scale-110" : ""}`}
                            style={{
                              width: `${Math.max(40, weight * 300)}px`,
                              height: "40px",
                              backgroundColor: getHeatColor(weight),
                              color: weight > 0.5 ? "#fff" : "#1e3a5f",
                            }}
                          >
                            {weight.toFixed(3)}
                          </div>
                          <span className="text-xs text-gray-600">{token}</span>
                          {isMax && <span className="text-[10px] text-amber-600 font-bold">最高关注</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 上下文向量 */}
              {contextVector && ["context", "complete"].includes(phase) && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    上下文向量 <InlineMath math="c = \sum_i \alpha_i h_i" />
                  </h4>
                  <BlockMath math={`c = [${contextVector.map((v) => v.toFixed(3)).join(",\\ ")}]`} />
                  <p className="text-xs text-emerald-600 mt-1">
                    注意力机制让每一步解码都生成独特的上下文向量，打破了固定瓶颈
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 初始化" },
                    { id: "score", label: "② 计算e_i分数" },
                    { id: "softmax", label: "③ Softmax权重" },
                    { id: "context", label: "④ 加权求和" },
                    { id: "complete", label: "⑤ 完成" },
                  ].map((step, idx, arr) => {
                    const order = ["init", "score", "softmax", "context", "complete"];
                    const isDone = order.indexOf(phase) >= order.indexOf(step.id);
                    return (
                      <div key={step.id} className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-lg font-medium ${
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

export default AttentionNLPVisualizer;

import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  generateSentimentAnalysisSteps,
  DEFAULT_SENTIMENT_SAMPLES,
  SentimentSample,
} from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface SentimentInput extends ProblemInput {
  sampleIdx: number;
}

function SentimentAnalysisVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10040);

  return (
    <ConfigurableVisualizer<SentimentInput, Record<string, never>>
      config={{
        defaultInput: { sampleIdx: 0 },

        algorithm: (input) => {
          const idx = typeof input.sampleIdx === "number" ? input.sampleIdx : parseInt(String(input.sampleIdx)) || 0;
          const sample = DEFAULT_SENTIMENT_SAMPLES[Math.max(0, Math.min(idx, DEFAULT_SENTIMENT_SAMPLES.length - 1))];
          return generateSentimentAnalysisSteps(sample);
        },

        inputTypes: [{ type: "number", key: "sampleIdx", label: "示例索引（0-1）", min: 0, max: 1 }],
        inputFields: [{ type: "number", key: "sampleIdx", label: "示例索引（0=正面, 1=负面）", placeholder: "0" }],

        testCases: [
          { label: "正面示例", value: { sampleIdx: 0 } },
          { label: "负面示例（含否定词）", value: { sampleIdx: 1 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const sample = variables?.sample as SentimentSample | undefined;
          const processedWords = (variables?.processedWords as unknown as Array<{
            word: string; rawScore: number; finalScore: number; negation: boolean; degree: number;
          }>) ?? [];
          const currentIdx = variables?.currentIdx as number | undefined;
          const normalizedScore = variables?.normalizedScore as number | undefined;
          const label = variables?.label as string | undefined;
          const isCorrect = variables?.isCorrect as boolean | undefined;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            "word-analysis": { label: "词语分析", color: "bg-blue-100 text-blue-700" },
            aggregate: { label: "得分汇总", color: "bg-amber-100 text-amber-700" },
            complete: { label: "分析完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const scoreToColor = (score: number) => {
            if (score > 0.2) return { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" };
            if (score < -0.2) return { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" };
            return { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
          };

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">情感分析</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="\text{score} = \sum_i \text{TF-IDF}(w_i) \times \text{polarity}(w_i) \times \text{degree}_i \times \text{negation}_i" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 输入文本 */}
              {sample && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">输入文本</h4>
                  <p className="text-base bg-gray-50 rounded p-3 border border-gray-100">"{sample.text}"</p>
                  <p className="text-xs text-gray-500 mt-2">真实标签：<span className="font-semibold text-blue-700">{sample.trueLabel}</span></p>
                </div>
              )}

              {/* 词语分析 */}
              {processedWords.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">逐词情感分析</h4>
                  <div className="space-y-2">
                    {sample?.words.map((w, i) => {
                      const processed = processedWords[i];
                      const isActive = i === currentIdx && phase === "word-analysis";
                      const isDone = i < processedWords.length;
                      return (
                        <div key={i} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${isActive ? "bg-blue-50 ring-1 ring-blue-300" : ""}`}>
                          <span className={`text-sm font-medium w-14 ${isDone ? "text-gray-800" : "text-gray-300"}`}>{w.word}</span>
                          {w.isNegation && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">否定词</span>}
                          {w.isDegree && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">程度×{w.degreeMultiplier}</span>}
                          {!w.isNegation && !w.isDegree && w.score !== 0 && (
                            <>
                              <span className="text-xs text-gray-500">原始分: {w.score.toFixed(2)}</span>
                              {processed && (
                                <>
                                  {processed.negation && <span className="text-xs text-red-600">→ 取反</span>}
                                  <span className={`text-xs font-bold ${processed.finalScore > 0 ? "text-green-600" : processed.finalScore < 0 ? "text-red-600" : "text-gray-400"}`}>
                                    最终: {processed.finalScore.toFixed(2)}
                                  </span>
                                </>
                              )}
                            </>
                          )}
                          {!w.isNegation && !w.isDegree && w.score === 0 && (
                            <span className="text-xs text-gray-400">中性词（跳过）</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 情感分数可视化 */}
              {normalizedScore !== undefined && ["aggregate", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">情感分数</h4>
                  <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-gray-400" />
                    <div
                      className="absolute top-0 bottom-0 flex items-center justify-center text-xs font-bold text-white rounded-full transition-all"
                      style={{
                        left: normalizedScore >= 0 ? "50%" : `${50 + normalizedScore * 50}%`,
                        width: `${Math.abs(normalizedScore) * 50}%`,
                        minWidth: "40px",
                        backgroundColor: normalizedScore > 0.2 ? "#22c55e" : normalizedScore < -0.2 ? "#ef4444" : "#94a3b8",
                      }}
                    >
                      {normalizedScore.toFixed(3)}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>-1（极负面）</span>
                    <span>0（中性）</span>
                    <span>+1（极正面）</span>
                  </div>
                </div>
              )}

              {/* 最终结果 */}
              {label && phase === "complete" && (() => {
                const colors = scoreToColor(normalizedScore ?? 0);
                return (
                  <div className="rounded-lg border-2 p-4 shadow-sm" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold" style={{ color: colors.text }}>{label}</span>
                      <span className={`text-sm ${isCorrect ? "text-emerald-600" : "text-red-600"}`}>
                        {isCorrect ? "✓ 分类正确" : "✗ 分类错误"}（真实: {sample?.trueLabel}）
                      </span>
                    </div>
                    <div className="mt-2">
                      <BlockMath math={`\\text{score} = ${normalizedScore?.toFixed(4) ?? "?"} \\Rightarrow \\text{${label}}`} />
                    </div>
                  </div>
                );
              })()}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入文本" },
                    { id: "word-analysis", label: "② 逐词分析" },
                    { id: "aggregate", label: "③ 汇总得分" },
                    { id: "complete", label: "④ 判断情感" },
                  ].map((step, idx, arr) => {
                    const order = ["init", "word-analysis", "aggregate", "complete"];
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

export default SentimentAnalysisVisualizer;

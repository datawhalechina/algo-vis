import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { generateTextSummarizationSteps, DEFAULT_SUMMARIZATION } from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface SummarizationInput extends ProblemInput {
  maxSentences: number;
}

function TextSummarizationVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10044);

  return (
    <ConfigurableVisualizer<SummarizationInput, Record<string, never>>
      config={{
        defaultInput: { maxSentences: 2 },

        algorithm: (input) => {
          const maxS = typeof input.maxSentences === "number" ? input.maxSentences : parseInt(String(input.maxSentences)) || 2;
          return generateTextSummarizationSteps({ ...DEFAULT_SUMMARIZATION, maxSentences: Math.max(1, Math.min(maxS, 4)) });
        },

        inputTypes: [{ type: "number", key: "maxSentences", label: "摘要句子数（1-4）", min: 1, max: 4 }],
        inputFields: [{ type: "number", key: "maxSentences", label: "摘要最大句子数", placeholder: "2" }],

        testCases: [
          { label: "2句摘要", value: { maxSentences: 2 } },
          { label: "3句摘要", value: { maxSentences: 3 } },
          { label: "1句摘要", value: { maxSentences: 1 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const sentences = (variables?.sentences as unknown as Array<{ text: string; position: number; tfScore: number; centralityScore: number }>) ?? DEFAULT_SUMMARIZATION.sentences;
          const scoredSentences = (variables?.scoredSentences as unknown as Array<{
            text: string; position: number; tfScore: number; centralityScore: number;
            posScore: number; totalScore: number;
          }>) ?? [];
          const currentIdx = variables?.currentIdx as number | undefined;
          const selected = (variables?.selected as unknown as Array<{ text: string; position: number; totalScore: number }>) ?? [];
          const sorted = (variables?.sorted as unknown as Array<{ text: string; totalScore: number }>) ?? [];

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            formula: { label: "评分公式", color: "bg-blue-100 text-blue-700" },
            scoring: { label: "句子打分", color: "bg-amber-100 text-amber-700" },
            selection: { label: "选句", color: "bg-violet-100 text-violet-700" },
            complete: { label: "摘要完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const maxScore = scoredSentences.length > 0 ? Math.max(...scoredSentences.map((s) => s.totalScore)) : 1;

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">文本摘要（抽取式）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="\text{score}(s) = w_1 \cdot \text{TF-IDF}(s) + w_2 \cdot \text{Centrality}(s) + w_3 \cdot \text{Position}(s)" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 文章句子列表 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  文章《{DEFAULT_SUMMARIZATION.title}》（{sentences.length} 句）
                </h4>
                <div className="space-y-3">
                  {sentences.map((s, i) => {
                    const scored = scoredSentences[i];
                    const isSelected = selected.some((sel) => sel.position === s.position);
                    const isCurrent = i === currentIdx && phase === "scoring";
                    const isTopRanked = sorted.length > 0 && sorted[0]?.text === s.text;
                    return (
                      <div key={i} className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected ? "border-emerald-400 bg-emerald-50" :
                        isCurrent ? "border-amber-400 bg-amber-50 ring-2 ring-amber-200" :
                        isTopRanked && phase === "selection" ? "border-blue-300 bg-blue-50" :
                        "border-gray-200 bg-gray-50"
                      }`}>
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-400 mt-0.5 font-mono">S{i + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{s.text}</p>
                            {scored && (
                              <div className="flex gap-3 mt-1 text-xs">
                                <span className="text-blue-600">TF-IDF: {s.tfScore.toFixed(2)}</span>
                                <span className="text-violet-600">中心度: {s.centralityScore.toFixed(2)}</span>
                                <span className="text-orange-600">位置: {scored.posScore.toFixed(2)}</span>
                                <span className="font-bold text-gray-700">总分: {scored.totalScore.toFixed(3)}</span>
                                {scored.totalScore > 0 && (
                                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden ml-2">
                                    <div className="h-3 rounded-full bg-amber-400"
                                      style={{ width: `${Math.round(scored.totalScore / maxScore * 100)}%` }} />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {isSelected && <span className="text-xs text-emerald-700 font-bold px-2 py-0.5 bg-emerald-100 rounded-full shrink-0">选中</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 摘要结果 */}
              {selected.length > 0 && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                    生成摘要（{selected.length} 句，压缩比 {Math.round(selected.length / sentences.length * 100)}%）
                  </h4>
                  <div className="space-y-2">
                    {selected.map((s, i) => (
                      <p key={i} className="text-sm text-emerald-900 bg-white rounded p-2 border border-emerald-200">
                        {s.text}
                      </p>
                    ))}
                  </div>
                  {phase === "complete" && (
                    <div className="mt-3">
                      <InlineMath math="\text{压缩比} = \frac{|\text{摘要句数}|}{|\text{原文句数}|}" />
                      <span className="text-xs text-emerald-700 ml-2">
                        = {selected.length}/{sentences.length} = {(selected.length / sentences.length).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 分句" },
                    { id: "formula", label: "② 评分公式" },
                    { id: "scoring", label: "③ 逐句打分" },
                    { id: "selection", label: "④ 选取TopK" },
                    { id: "complete", label: "⑤ 生成摘要" },
                  ].map((step, idx, arr) => {
                    const order = ["init", "formula", "scoring", "selection", "complete"];
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

export default TextSummarizationVisualizer;

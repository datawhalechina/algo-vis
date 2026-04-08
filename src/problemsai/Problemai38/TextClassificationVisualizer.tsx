import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  generateTextClassificationSteps,
  DEFAULT_SAMPLES,
  CATEGORIES,
  TextClassificationSample,
} from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface TextClassificationInput extends ProblemInput {
  sampleIdx: number;
}

function TextClassificationVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10038);

  return (
    <ConfigurableVisualizer<TextClassificationInput, Record<string, never>>
      config={{
        defaultInput: { sampleIdx: 0 },

        algorithm: (input) => {
          const idx = typeof input.sampleIdx === "number" ? input.sampleIdx : parseInt(String(input.sampleIdx)) || 0;
          const sample = DEFAULT_SAMPLES[Math.max(0, Math.min(idx, DEFAULT_SAMPLES.length - 1))];
          return generateTextClassificationSteps(sample);
        },

        inputTypes: [{ type: "number", key: "sampleIdx", label: "示例索引（0-2）", min: 0, max: 2 }],
        inputFields: [{ type: "number", key: "sampleIdx", label: "示例索引（0=正面, 1=负面, 2=中性）", placeholder: "0" }],

        testCases: [
          { label: "正面评价", value: { sampleIdx: 0 } },
          { label: "负面评价", value: { sampleIdx: 1 } },
          { label: "中性评价", value: { sampleIdx: 2 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const sample = variables?.sample as TextClassificationSample | undefined;
          const tfidf = (variables?.tfidf as unknown as Record<string, number>) ?? {};
          const probs = (variables?.probs as unknown as Record<string, number>) ?? {};
          const predictedLabel = variables?.predictedLabel as string | undefined;
          const isCorrect = variables?.isCorrect as boolean | undefined;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            feature: { label: "特征提取", color: "bg-blue-100 text-blue-700" },
            scoring: { label: "类别打分", color: "bg-violet-100 text-violet-700" },
            softmax: { label: "Softmax", color: "bg-amber-100 text-amber-700" },
            complete: { label: "预测完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const catColors: Record<string, string> = {
            "正面": "#22c55e",
            "负面": "#ef4444",
            "中性": "#94a3b8",
          };

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">文本分类</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="P(c|x) = \text{Softmax}(\text{score}(c, x)),\quad \hat{c} = \arg\max_c P(c|x)" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 输入文本 */}
              {sample && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">输入文本</h4>
                  <p className="text-base text-gray-900 bg-gray-50 rounded p-3 border border-gray-100">
                    "{sample.text}"
                  </p>
                  <p className="text-xs text-gray-500 mt-2">真实标签：
                    <span className="font-semibold" style={{ color: catColors[sample.trueLabel] }}>
                      {sample.trueLabel}
                    </span>
                  </p>
                </div>
              )}

              {/* TF-IDF 特征 */}
              {Object.keys(tfidf).length > 0 && ["feature", "scoring", "softmax", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    TF-IDF 特征 <InlineMath math="\text{TF-IDF}(t,d) = \text{TF}(t,d) \times \log\frac{N}{\text{DF}(t)}" />
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(tfidf)
                      .sort(([, a], [, b]) => b - a)
                      .map(([word, score]) => (
                        <div key={word} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700 w-16">{word}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                            <div
                              className="h-4 rounded-full bg-blue-400"
                              style={{ width: `${Math.round(score * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-gray-500 w-10">{score.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 类别概率 */}
              {Object.keys(probs).length > 0 && ["softmax", "complete"].includes(phase) && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    分类概率 <InlineMath math="P(c|x)" />
                  </h4>
                  <div className="space-y-3">
                    {CATEGORIES.map((cat) => {
                      const prob = probs[cat] ?? 0;
                      const isMax = cat === predictedLabel;
                      return (
                        <div key={cat} className={`rounded-lg p-3 border ${isMax ? "border-blue-300 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold" style={{ color: catColors[cat] }}>{cat}</span>
                            <span className="text-sm font-mono font-bold">{(prob * 100).toFixed(1)}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className="h-3 rounded-full transition-all"
                              style={{ width: `${Math.round(prob * 100)}%`, backgroundColor: catColors[cat] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 预测结果 */}
              {predictedLabel && phase === "complete" && (
                <div className={`rounded-lg border p-4 shadow-sm ${isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                  <h4 className={`text-sm font-semibold mb-1 ${isCorrect ? "text-emerald-800" : "text-red-800"}`}>
                    预测结果：{predictedLabel} {isCorrect ? "✓ 正确" : "✗ 错误"}
                  </h4>
                  <p className={`text-xs ${isCorrect ? "text-emerald-600" : "text-red-600"}`}>
                    置信度：{((probs[predictedLabel] ?? 0) * 100).toFixed(1)}%
                  </p>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 输入文本" },
                    { id: "feature", label: "② TF-IDF特征" },
                    { id: "scoring", label: "③ 类别打分" },
                    { id: "softmax", label: "④ Softmax" },
                    { id: "complete", label: "⑤ 预测结果" },
                  ].map((step, idx, arr) => {
                    const order = ["init", "feature", "scoring", "softmax", "complete"];
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

export default TextClassificationVisualizer;

import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  generatePOSTaggingSteps,
  DEFAULT_POS_SAMPLES,
  POSToken,
} from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface POSTaggingInput extends ProblemInput {
  sampleIdx: number;
}

function POSTaggingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10046);

  return (
    <ConfigurableVisualizer<POSTaggingInput, Record<string, never>>
      config={{
        defaultInput: { sampleIdx: 0 },

        algorithm: (input) => {
          const idx = typeof input.sampleIdx === "number" ? input.sampleIdx : parseInt(String(input.sampleIdx)) || 0;
          const sample = DEFAULT_POS_SAMPLES[Math.max(0, Math.min(idx, DEFAULT_POS_SAMPLES.length - 1))];
          return generatePOSTaggingSteps(sample);
        },

        inputTypes: [{ type: "number", key: "sampleIdx", label: "示例索引（0-1）", min: 0, max: 1 }],
        inputFields: [{ type: "number", key: "sampleIdx", label: "示例索引（0=The cat sat..., 1=She runs...）", placeholder: "0" }],

        testCases: [
          { label: "The cat sat on the mat", value: { sampleIdx: 0 } },
          { label: "She runs very quickly", value: { sampleIdx: 1 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const sentence = (variables?.sentence as string) ?? "";
          const tokens = (variables?.tokens as unknown as POSToken[]) ?? [];
          const taggedTokens = (variables?.taggedTokens as unknown as POSToken[]) ?? [];
          const currentIdx = variables?.currentIdx as number | undefined;
          const tagCounts = (variables?.tagCounts as unknown as Record<string, number>) ?? {};

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            formula: { label: "模型推断", color: "bg-blue-100 text-blue-700" },
            tagging: { label: "逐词标注", color: "bg-violet-100 text-violet-700" },
            complete: { label: "标注完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const TAG_DESC: Record<string, string> = {
            DT: "限定词", NN: "名词", NNP: "专有名词", NNS: "名词复数",
            VBD: "动词过去式", VBZ: "动词三单", VB: "动词原形",
            IN: "介词", JJ: "形容词", RB: "副词", PRP: "人称代词", CC: "并列连词",
          };

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">词性标注（POS Tagging）</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="P(t_1,\ldots,t_n|w_1,\ldots,w_n) = \prod_{i=1}^{n} P(t_i|w_i,\text{context})" />
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${pi.color}`}>{pi.label}</span>
                </div>
              </div>

              {/* 句子 */}
              {sentence && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">输入句子</h4>
                  <p className="text-base text-gray-900 font-medium bg-gray-50 rounded p-3 border border-gray-100">"{sentence}"</p>
                </div>
              )}

              {/* 词性标注可视化 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">词性标注结果</h4>
                <div className="flex items-end gap-4 flex-wrap">
                  {tokens.map((t, i) => {
                    const isTagged = taggedTokens.some((tt) => tt.word === t.word);
                    const isCurrent = i === currentIdx && phase === "tagging";
                    return (
                      <div key={i} className={`flex flex-col items-center gap-1 transition-all ${isCurrent ? "scale-110" : ""}`}>
                        {/* 词性标签 */}
                        <div
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                            isTagged ? "opacity-100" : "opacity-20"
                          } ${isCurrent ? "shadow-lg ring-2 ring-offset-1 ring-white" : ""}`}
                          style={{ backgroundColor: t.color + "30", color: t.color, border: `2px solid ${t.color}` }}
                        >
                          {t.tag}
                        </div>
                        {/* 词语 */}
                        <div className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-all ${
                          isCurrent ? "shadow-lg" : ""
                        } ${isTagged ? "" : "opacity-30"}`}
                          style={{ borderColor: isTagged ? t.color + "60" : "#e2e8f0", backgroundColor: isTagged ? t.color + "10" : "#f8fafc", color: isTagged ? "#1e293b" : "#94a3b8" }}
                        >
                          {t.word}
                        </div>
                        {/* 中文说明 */}
                        <span className={`text-[10px] ${isTagged ? "text-gray-500" : "text-gray-300"}`}>
                          {isTagged ? TAG_DESC[t.tag] ?? t.tag : "..."}
                        </span>
                        {/* 置信度 */}
                        {isTagged && (
                          <div className="w-12 bg-gray-200 rounded-full h-1 overflow-hidden">
                            <div className="h-1 rounded-full" style={{ width: `${t.confidence * 100}%`, backgroundColor: t.color }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 词性图例 */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 shadow-sm">
                <h4 className="text-xs font-semibold text-gray-600 mb-2">Penn Treebank 词性标签</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(TAG_DESC).map(([tag, desc]) => (
                    <div key={tag} className="flex items-center gap-1">
                      <span className="font-mono font-bold text-gray-700 w-10">{tag}</span>
                      <span className="text-gray-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 统计 */}
              {phase === "complete" && Object.keys(tagCounts).length > 0 && (
                <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-2">词性分布</h4>
                  <div className="flex gap-3 flex-wrap">
                    {Object.entries(tagCounts).map(([tag, count]) => {
                      const t = tokens.find((tk) => tk.tag === tag);
                      return (
                        <div key={tag} className="flex items-center gap-1 text-sm">
                          <span className="font-bold font-mono" style={{ color: t?.color ?? "#94a3b8" }}>{tag}</span>
                          <span className="text-gray-500">×{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 分词" },
                    { id: "formula", label: "② 序列建模" },
                    { id: "tagging", label: "③ 逐词标注" },
                    { id: "complete", label: "④ 输出结果" },
                  ].map((step, idx, arr) => {
                    const order = ["init", "formula", "tagging", "complete"];
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

export default POSTaggingVisualizer;

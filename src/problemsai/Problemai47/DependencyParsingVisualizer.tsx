import { ConfigurableVisualizer } from "@/components/visualizers/ConfigurableVisualizer";
import { CoreIdeaBox } from "@/components/visualizers/CoreIdeaBox";
import { ProblemInput } from "@/types/visualization";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import {
  generateDependencyParsingSteps,
  DEFAULT_DEP_SAMPLES,
  DepToken,
  getDepColor,
} from "./algorithm";
import { getAiProblemCoreIdea } from "@/config/aiProblemCoreIdeas";

interface DepParsingInput extends ProblemInput {
  sampleIdx: number;
}

function DependencyParsingVisualizer() {
  const coreIdea = getAiProblemCoreIdea(10047);

  return (
    <ConfigurableVisualizer<DepParsingInput, Record<string, never>>
      config={{
        defaultInput: { sampleIdx: 0 },

        algorithm: (input) => {
          const idx = typeof input.sampleIdx === "number" ? input.sampleIdx : parseInt(String(input.sampleIdx)) || 0;
          const sample = DEFAULT_DEP_SAMPLES[Math.max(0, Math.min(idx, DEFAULT_DEP_SAMPLES.length - 1))];
          return generateDependencyParsingSteps(sample);
        },

        inputTypes: [{ type: "number", key: "sampleIdx", label: "示例索引（0-1）", min: 0, max: 1 }],
        inputFields: [{ type: "number", key: "sampleIdx", label: "示例索引（0=The cat sat, 1=She loves music）", placeholder: "0" }],

        testCases: [
          { label: "The cat sat on the mat", value: { sampleIdx: 0 } },
          { label: "She loves beautiful music", value: { sampleIdx: 1 } },
        ],

        render: ({ variables }) => {
          const phase = (variables?.phase as string) ?? "init";
          const sentence = (variables?.sentence as string) ?? "";
          const tokens = (variables?.tokens as unknown as DepToken[]) ?? [];
          const parsedArcs = (variables?.parsedArcs as unknown as DepToken[]) ?? [];
          const currentToken = variables?.currentToken as unknown as DepToken | undefined;

          const phaseMap: Record<string, { label: string; color: string }> = {
            init: { label: "初始化", color: "bg-gray-100 text-gray-700" },
            intro: { label: "性质介绍", color: "bg-blue-100 text-blue-700" },
            root: { label: "识别ROOT", color: "bg-indigo-100 text-indigo-700" },
            parsing: { label: "添加依存弧", color: "bg-violet-100 text-violet-700" },
            complete: { label: "解析完成", color: "bg-emerald-100 text-emerald-700" },
          };
          const pi = phaseMap[phase] ?? { label: phase, color: "bg-gray-100 text-gray-700" };

          const parsedIds = new Set(parsedArcs.map((t) => t.id));

          return (
            <div className="space-y-4">
              {coreIdea && <CoreIdeaBox {...coreIdea} />}

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">依存句法分析</h3>
                    <div className="text-xs text-gray-500 mt-1">
                      <InlineMath math="\forall w_i \in S: \exists! \text{head}(w_i),\; \text{depRel}(w_i) \quad \Rightarrow \text{Dependency Tree}" />
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

              {/* 依存树可视化 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-4">依存句法树</h4>

                {/* 词语排列 */}
                <div className="relative">
                  <div className="flex items-end gap-2 flex-wrap pt-16">
                    {tokens.map((t) => {
                      const isParsed = parsedIds.has(t.id);
                      const isCurrent = t.id === currentToken?.id;
                      const isRoot = t.depRel === "ROOT";
                      const color = getDepColor(t.depRel);
                      return (
                        <div key={t.id} className={`flex flex-col items-center gap-1 relative transition-all ${isCurrent ? "scale-110" : ""}`}>
                          {/* 依存标签（箭头上方） */}
                          {isParsed && (
                            <div className="text-[10px] font-bold font-mono px-1 py-0.5 rounded"
                              style={{ color, backgroundColor: color + "20" }}>
                              {t.depRel}
                            </div>
                          )}
                          {/* 词语盒子 */}
                          <div className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                            isCurrent ? "shadow-lg ring-2 ring-offset-1 ring-violet-400" : ""
                          } ${!isParsed ? "opacity-40" : ""}`}
                            style={{
                              borderColor: isParsed ? color + "80" : "#e2e8f0",
                              backgroundColor: isParsed ? color + "15" : "#f8fafc",
                            }}
                          >
                            {t.word}
                          </div>
                          {/* id标签 */}
                          <span className="text-[9px] text-gray-400 font-mono">w{t.id}</span>
                          {isRoot && isParsed && (
                            <span className="text-[10px] font-bold text-indigo-600">ROOT</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 依存弧列表 */}
              {parsedArcs.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">依存关系列表</h4>
                  <div className="space-y-2">
                    {parsedArcs.map((t) => {
                      const headToken = tokens.find((h) => h.id === t.head);
                      const color = getDepColor(t.depRel);
                      const isCurrent = t.id === currentToken?.id;
                      return (
                        <div key={t.id} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${isCurrent ? "bg-violet-50 ring-1 ring-violet-300" : "bg-gray-50"}`}>
                          <span className="text-sm font-medium text-gray-800 w-20">{t.word}</span>
                          <span className="text-xs text-gray-400">←</span>
                          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded" style={{ color, backgroundColor: color + "20" }}>
                            {t.depRel}
                          </span>
                          <span className="text-xs text-gray-400">←</span>
                          <span className="text-sm font-medium text-gray-600">{headToken?.word ?? "ROOT"}</span>
                          <span className="text-xs text-gray-500 ml-auto">{t.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 依存关系图例 */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 shadow-sm">
                <h4 className="text-xs font-semibold text-gray-600 mb-2">常见依存关系类型</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { rel: "ROOT", desc: "根节点" },
                    { rel: "nsubj", desc: "主语" },
                    { rel: "dobj", desc: "宾语" },
                    { rel: "prep", desc: "介词短语" },
                    { rel: "pobj", desc: "介词宾语" },
                    { rel: "det", desc: "限定词" },
                    { rel: "amod", desc: "形容词修饰" },
                  ].map(({ rel, desc }) => (
                    <div key={rel} className="flex items-center gap-1 text-xs">
                      <span className="font-bold font-mono" style={{ color: getDepColor(rel) }}>{rel}</span>
                      <span className="text-gray-500">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">计算流程</h4>
                <div className="flex items-center flex-wrap gap-2 text-xs">
                  {[
                    { id: "init", label: "① 初始化" },
                    { id: "intro", label: "② 树性质" },
                    { id: "root", label: "③ 识别ROOT" },
                    { id: "parsing", label: "④ 添加依存弧" },
                    { id: "complete", label: "⑤ 完成" },
                  ].map((step, idx, arr) => {
                    const order = ["init", "intro", "root", "parsing", "complete"];
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

export default DependencyParsingVisualizer;
